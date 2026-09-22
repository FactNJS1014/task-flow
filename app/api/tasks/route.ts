import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { taskSchema } from "@/lib/validation";

// 📌 1. GET Method สำหรับดึงรายการ Tasks (ต้องมี export async function GET)
export async function GET(req: NextRequest) {
  try {
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

// 📌 2. POST Method สำหรับสร้าง Task ใหม่
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

    await db.notification.create({
      data: {
        userId: session.id,
        taskId: task.id,
        type: "TASK_CREATED",
        title: "New Task Created",
        message: `Task "${task.title}" has been created for ${targetDueDate.toLocaleString("en-GB")}.`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE_TASK",
        entity: "Task",
        entityId: task.id,
        metadata: { title: task.title, priority: task.priority },
      },
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
