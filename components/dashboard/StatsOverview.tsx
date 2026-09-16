"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Layers,
  Ban,
} from "lucide-react";

interface StatsOverviewProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    cancelled: number;
    overdue: number;
    dueToday: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: Layers,
      color: "text-slate-800",
      bg: "bg-slate-50 border-slate-200",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50 border-emerald-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50/50 border-amber-100",
    },
    {
      label: "Todo",
      value: stats.todo,
      icon: ListTodo,
      color: "text-blue-600",
      bg: "bg-blue-50/50 border-blue-100",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50/50 border-red-100",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: Ban,
      color: "text-gray-500",
      bg: "bg-gray-50 border-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`p-4 rounded-xl border ${c.bg} shadow-sm transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {c.label}
              </span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        );
      })}
    </div>
  );
}
