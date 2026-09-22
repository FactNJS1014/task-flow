import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail, generateEmailTemplate } from "@/lib/mail";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Cron Secret" },
      { status: 401 },
    );
  }

  const now = new Date();
  const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    // 📌 ค้นหากิจกรรมที่กำลังจะถึงกำหนดภายใน 10 นาทีข้างหน้า
    const upcomingTasks = await db.task.findMany({
      where: {
        dueDate: { gte: now, lte: in10Minutes },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        reminded10m: false, // ยังไม่เคยส่งแจ้งเตือน
      },
      include: { user: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const task of upcomingTasks) {
      // 1. เพิ่มการแจ้งเตือนในระบบ
      await db.notification.create({
        data: {
          userId: task.userId,
          taskId: task.id,
          type: "TASK_REMINDER",
          title: "⏰ Task Due in 10 Minutes",
          message: `Reminder: "${task.title}" is due at ${new Date(task.dueDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}!`,
        },
      });

      // 2. ส่งอีเมลแจ้งเตือนผู้ใช้งานผ่าน Gmail SMTP
      await sendMail({
        to: task.user.email,
        subject: `[TaskFlow Reminder] ⏰ Task Due in 10 Minutes: ${task.title}`,
        html: generateEmailTemplate(
          "Task Due in 10 Minutes!",
          `<p>Your task <strong>"${task.title}"</strong> is scheduled for <strong>${new Date(task.dueDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</strong> (${new Date(task.dueDate).toLocaleDateString("en-GB")}).</p>
           <p>Priority: <strong>${task.priority}</strong></p>`,
          `${appUrl}/tasks`,
        ),
      });

      // 3. ทำเครื่องหมายว่าส่งแจ้งเตือนแล้ว เพื่อป้องกันการส่งซ้ำ
      await db.task.update({
        where: { id: task.id },
        data: { reminded10m: true },
      });
    }

    return NextResponse.json({
      success: true,
      processed: { count: upcomingTasks.length },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
