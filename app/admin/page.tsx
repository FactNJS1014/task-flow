import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.task.count(),
    db.task.count({ where: { status: "COMPLETED" } }),
    db.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
    db.task.count({
      where: {
        dueDate: { lt: today },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          System Admin Dashboard
        </h1>
        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
          Administrator Role
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase">
            Total Users
          </span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 text-xs font-semibold uppercase">
            Active Users
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {activeUsers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase">
            Total Tasks
          </span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-blue-600 text-xs font-semibold uppercase">
            Completed
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {completedTasks}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-amber-600 text-xs font-semibold uppercase">
            Pending
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingTasks}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-red-600 text-xs font-semibold uppercase">
            Overdue
          </span>
          <p className="text-2xl font-bold text-red-600 mt-1">{overdueTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/users"
          className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 transition shadow-sm block"
        >
          <h2 className="text-lg font-bold text-slate-800">
            User Management &rarr;
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            View, activate, deactivate, or delete registered platform users.
          </p>
        </Link>
        <Link
          href="/admin/tasks"
          className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 transition shadow-sm block"
        >
          <h2 className="text-lg font-bold text-slate-800">
            System Task Overview &rarr;
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Search, filter, and inspect tasks created across all users in the
            system.
          </p>
        </Link>
      </div>
    </div>
  );
}
