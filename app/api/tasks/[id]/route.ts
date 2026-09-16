import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validation";
import { sendMail, generateEmailTemplate } from "@/lib/mail";

// 📌 1. GET Handler
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params; // 👈 Unwrap params ด้วย await
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const task = await db.task.findUnique({ where: { id } });
  if (!task)
    return NextResponse.json(
      { success: false, message: "Task not found" },
      { status: 404 },
    );

  if (task.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true, data: task });
}

// 📌 2. PATCH Handler
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params; // 👈 Unwrap params ด้วย await
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  try {
    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask)
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 },
      );

    if (existingTask.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = taskSchema.partial().parse(body);

    const isCompleting =
      validated.status === "COMPLETED" && existingTask.status !== "COMPLETED";
    const isReopening =
      validated.status &&
      validated.status !== "COMPLETED" &&
      existingTask.status === "COMPLETED";

    let completedAt = existingTask.completedAt;
    if (isCompleting) completedAt = new Date();
    if (isReopening) completedAt = null;

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        completedAt,
      },
    });

    if (isCompleting) {
      await db.notification.create({
        data: {
          userId: existingTask.userId,
          taskId: updatedTask.id,
          type: "TASK_COMPLETED",
          title: "Task Completed",
          message: `Task "${updatedTask.title}" was marked as completed.`,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      sendMail({
        to: session.email,
        subject: `[TaskFlow] Task Completed: ${updatedTask.title}`,
        html: generateEmailTemplate(
          "Task Completed 🎉",
          `<p>Great job! You completed <strong>"${updatedTask.title}"</strong> on ${new Date().toLocaleString("en-GB")}.</p>`,
          `${appUrl}/tasks/${updatedTask.id}`,
        ),
      });
    }

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: isCompleting ? "COMPLETE_TASK" : "UPDATE_TASK",
        entity: "Task",
        entityId: updatedTask.id,
      },
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 400 },
    );
  }
}

// 📌 3. DELETE Handler
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params; // 👈 Unwrap params ด้วย await
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const existingTask = await db.task.findUnique({ where: { id } });
  if (!existingTask)
    return NextResponse.json(
      { success: false, message: "Task not found" },
      { status: 404 },
    );

  if (existingTask.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  await db.task.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: session.id,
      action: "DELETE_TASK",
      entity: "Task",
      entityId: id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Task deleted successfully",
  });
}
