import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validated = taskSchema.parse(body);

    const targetDueDate = new Date(validated.dueDate);

    // 📌 1. บันทึกข้อมูล Task ลงในฐานข้อมูล
    const task = await db.task.create({
      data: {
        userId: session.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        status: validated.status,
        dueDate: targetDueDate,
        completedAt: validated.status === "COMPLETED" ? new Date() : null,
      },
    });

    // 📌 2. บันทึก In-App Notification (แสดงในกระดิ่งแจ้งเตือนบนเว็บ)
    await db.notification.create({
      data: {
        userId: session.id,
        taskId: task.id,
        type: "TASK_CREATED",
        title: "New Task Created",
        message: `Task "${task.title}" has been created for ${targetDueDate.toLocaleString("en-GB")}.`,
      },
    });

    // 📌 3. บันทึก Audit Log
    await db.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE_TASK",
        entity: "Task",
        entityId: task.id,
        metadata: { title: task.title, priority: task.priority },
      },
    });

    // ❌ ตัดการส่ง sendMail() ในขั้นตอนสร้างออก
    // อีเมลจะถูกส่งจาก Cron Reminder ล่วงหน้า 10 นาทีตามเวลา dueDate เท่านั้น

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tasks Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.errors?.[0]?.message ||
          error.message ||
          "Failed to create task",
      },
      { status: 400 },
    );
  }
}
