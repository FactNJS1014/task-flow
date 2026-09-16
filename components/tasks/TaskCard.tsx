"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    dueDate: string;
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: any) => void;
}

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const due = new Date(task.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isCompleted = task.status === "COMPLETED";
  const isOverdue = !isCompleted && task.status !== "CANCELLED" && due < now;
  const isDueToday =
    !isCompleted && due.toDateString() === new Date().toDateString();

  const priorityStyles = {
    LOW: "bg-gray-100 text-gray-700 border-gray-200",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    URGENT: "bg-red-50 text-red-700 border-red-200 animate-pulse",
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition shadow-sm hover:shadow-md ${isOverdue ? "border-red-300 bg-red-50/20" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {task.category}
        </span>
        <div className="flex items-center gap-1.5">
          {isOverdue && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              OVERDUE
            </span>
          )}
          {isDueToday && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              DUE TODAY
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2 py-0.5 border rounded ${priorityStyles[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      <h3
        className={`font-semibold text-lg text-slate-800 ${isCompleted ? "line-through text-slate-400" : ""}`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-medium">
            Task Due Date
          </span>
          <span className="font-semibold text-slate-700">
            {new Date(task.dueDate).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === "COMPLETED"
              ? "bg-emerald-100 text-emerald-800"
              : task.status === "IN_PROGRESS"
                ? "bg-amber-100 text-amber-800"
                : task.status === "CANCELLED"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition"
        >
          Edit
        </button>

        {!isCompleted && task.status !== "CANCELLED" && (
          <button
            onClick={() => onComplete(task.id)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition"
          >
            Complete
          </button>
        )}

        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md font-medium transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
