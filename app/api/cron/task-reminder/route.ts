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
  // กำหนดช่วงเวลา 10 นาทีข้างหน้า
  const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    // 📌 1. ค้นหางานที่กำลังจะถึงกำหนดใน 10 นาที และยังไม่ได้ส่งแจ้งเตือน
    const upcomingTasks = await db.task.findMany({
      where: {
        dueDate: { gte: now, lte: in10Minutes },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        reminded10m: false,
      },
      include: { user: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const task of upcomingTasks) {
      // บันทึก In-App Notification
      await db.notification.create({
        data: {
          userId: task.userId,
          taskId: task.id,
          type: "TASK_REMINDER",
          title: "⏰ Task Due in 10 Minutes",
          message: `Reminder: Task "${task.title}" is due at ${new Date(task.dueDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}!`,
        },
      });

      // ส่ง Gmail Notification
      sendMail({
        to: task.user.email,
        subject: `[TaskFlow Reminder] ⏰ Task Due in 10 Minutes: ${task.title}`,
        html: generateEmailTemplate(
          "Task Due in 10 Minutes!",
          `<p>Your task <strong>"${task.title}"</strong> is scheduled to be completed at <strong>${new Date(task.dueDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</strong> (${new Date(task.dueDate).toLocaleDateString("en-GB")}).</p>
           <p>Priority: <strong>${task.priority}</strong></p>`,
          `${appUrl}/tasks/${task.id}`,
        ),
      });

      // อัปเดตสถานะว่าส่งแจ้งเตือนแล้ว
      await db.task.update({
        where: { id: task.id },
        data: { reminded10m: true },
      });
    }

    return NextResponse.json({
      success: true,
      processed: { reminded10mCount: upcomingTasks.length },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
