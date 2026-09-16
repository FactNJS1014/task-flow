"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Clock } from "lucide-react";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchTaskDetail();
  }, [id]);

  async function fetchTaskDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`);
      const json = await res.json();
      if (json.success) setTask(json.data);
      else router.push("/tasks");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    fetchTaskDetail();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.push("/tasks");
  }

  if (loading)
    return <div className="p-6 text-slate-400">Loading task details...</div>;
  if (!task) return null;

  const due = new Date(task.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isCompleted = task.status === "COMPLETED";
  const isOverdue = !isCompleted && task.status !== "CANCELLED" && due < now;
  const isDueToday =
    !isCompleted && due.toDateString() === new Date().toDateString();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                {task.category}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                Priority: {task.priority}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-sm"
            >
              Edit
            </button>
            {!isCompleted && (
              <button
                onClick={handleComplete}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-sm"
              >
                Complete
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        {isOverdue && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">OVERDUE ALERT:</span> This task has
              passed its deadline date.
            </div>
          </div>
        )}

        {isDueToday && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800 text-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">DUE TODAY:</span> This task is
              scheduled for completion today.
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
            Description
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Date Workflow Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="block text-slate-400 font-medium">
              Task End Date / Due Date
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {new Date(task.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Created At</span>
            <span className="font-semibold text-slate-600">
              {new Date(task.createdAt).toLocaleString("en-GB")}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">
              Last Updated
            </span>
            <span className="font-semibold text-slate-600">
              {new Date(task.updatedAt).toLocaleString("en-GB")}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">
              Completed At
            </span>
            <span className="font-semibold text-slate-600">
              {task.completedAt
                ? new Date(task.completedAt).toLocaleString("en-GB")
                : "-"}
            </span>
          </div>
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTaskDetail}
        initialData={task}
      />
    </div>
  );
}
