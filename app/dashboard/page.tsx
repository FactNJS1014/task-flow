import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 📌 แก้ไขจาก session.user.id เป็น session.id
  const [total, todo, inProgress, completed, cancelled, overdue, dueToday] =
    await Promise.all([
      db.task.count({ where: { userId: session.id } }),
      db.task.count({ where: { userId: session.id, status: "TODO" } }),
      db.task.count({ where: { userId: session.id, status: "IN_PROGRESS" } }),
      db.task.count({ where: { userId: session.id, status: "COMPLETED" } }),
      db.task.count({ where: { userId: session.id, status: "CANCELLED" } }),
      db.task.count({
        where: {
          userId: session.id,
          dueDate: { lt: today },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      db.task.count({
        where: {
          userId: session.id,
          dueDate: { gte: today, lt: tomorrow },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
    ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* 📌 แก้ไขจาก session.user.firstName เป็น session.firstName */}
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {session.firstName}!
          </h1>
          <p className="text-slate-500 text-sm">
            Here is your real-time productivity overview.
          </p>
        </div>
        <Link
          href="/tasks?action=create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          + Create Task
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase">
            Total Tasks
          </span>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">{total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 text-xs font-semibold uppercase">
            Completed
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {completed}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-amber-600 text-xs font-semibold uppercase">
            In Progress
          </span>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {inProgress}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-red-600 text-xs font-semibold uppercase">
            Overdue
          </span>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{overdue}</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Quick Filters</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tasks"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium"
          >
            View All Tasks ({total})
          </Link>
          <Link
            href="/tasks?dueDateFilter=today"
            className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-sm font-medium"
          >
            Due Today ({dueToday})
          </Link>
          <Link
            href="/tasks?dueDateFilter=overdue"
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-medium"
          >
            Overdue Tasks ({overdue})
          </Link>
          <Link
            href="/tasks?status=COMPLETED"
            className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-sm font-medium"
          >
            Completed Tasks ({completed})
          </Link>
        </div>
      </div>
    </div>
  );
}
