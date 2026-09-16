import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validation";
import { sendMail, generateEmailTemplate } from "@/lib/mail";

export async function GET(req: NextRequest) {
  try {
    // 📌 ต้องใช้ await กับ getSession() ใน Next.js 16
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const dueDateFilter = searchParams.get("dueDateFilter");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = { userId: session.id };

    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (category && category !== "ALL") where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDateFilter === "today") {
      where.dueDate = { gte: today, lt: tomorrow };
    } else if (dueDateFilter === "upcoming") {
      where.dueDate = { gte: tomorrow };
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    } else if (dueDateFilter === "overdue") {
      where.dueDate = { lt: today };
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "dueDate_asc") orderBy = { dueDate: "asc" };
    if (sort === "dueDate_desc") orderBy = { dueDate: "desc" };
    if (sort === "title_asc") orderBy = { title: "asc" };
    if (sort === "title_desc") orderBy = { title: "desc" };

    const [tasks, total] = await Promise.all([
      db.task.findMany({ where, orderBy, skip, take: limit }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 📌 ต้อง await getSession() ใน Next.js 16
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

    // 📌 บันทึกลง Prisma โดยใช้ session.id (ไม่ใช่ session.user.id)
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

    // สร้าง Notification ในระบบ
    await db.notification.create({
      data: {
        userId: session.id,
        taskId: task.id,
        type: "TASK_CREATED",
        title: "New Task Created",
        message: `Task "${task.title}" has been created with due date ${targetDueDate.toLocaleDateString("en-GB")}.`,
      },
    });

    // บันทึก Audit Log
    await db.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE_TASK",
        entity: "Task",
        entityId: task.id,
        metadata: { title: task.title, priority: task.priority },
      },
    });

    // ส่ง Gmail Notification แบบ Async (ไม่บล็อกหลัก)
    const mailContent = `
      <p>Your task <strong>"${task.title}"</strong> has been successfully created.</p>
      <ul>
        <li><strong>Priority:</strong> ${task.priority}</li>
        <li><strong>Status:</strong> ${task.status}</li>
        <li><strong>Task Due Date:</strong> ${targetDueDate.toLocaleDateString("en-GB")}</li>
      </ul>
    `;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    sendMail({
      to: session.email,
      subject: `[TaskFlow] Task Created: ${task.title}`,
      html: generateEmailTemplate(
        "New Task Created",
        mailContent,
        `${appUrl}/tasks/${task.id}`,
      ),
    });

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
