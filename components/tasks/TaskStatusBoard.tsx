"use client";

import React from "react";
import Link from "next/link";
import { TaskItem } from "@/types";

interface TaskStatusBoardProps {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, newStatus: TaskItem["status"]) => void;
}

export function TaskStatusBoard({
  tasks,
  onStatusChange,
}: TaskStatusBoardProps) {
  const columns: {
    label: string;
    status: TaskItem["status"];
    color: string;
  }[] = [
    { label: "TODO", status: "TODO", color: "border-slate-400" },
    { label: "IN PROGRESS", status: "IN_PROGRESS", color: "border-amber-500" },
    { label: "COMPLETED", status: "COMPLETED", color: "border-emerald-500" },
    { label: "CANCELLED", status: "CANCELLED", color: "border-gray-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="bg-slate-100/70 p-4 rounded-xl border border-slate-200"
          >
            <div
              className={`flex items-center justify-between pb-3 border-b-2 mb-3 ${col.color}`}
            >
              <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
              <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition"
                >
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-semibold text-sm text-slate-800 hover:text-blue-600 line-clamp-2"
                  >
                    {task.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">{task.category}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t">
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString("en-GB")}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onStatusChange(task.id, e.target.value as any)
                      }
                      className="bg-slate-50 border rounded text-[10px] p-0.5 font-medium text-slate-700"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
