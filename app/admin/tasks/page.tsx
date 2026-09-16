"use client";

import React, { useEffect, useState } from "react";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks");
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        System Tasks Overview (Admin)
      </h1>

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Owner</th>
                <th className="p-4">Task Title</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="p-4 font-medium text-slate-900">
                    {t.user?.firstName} {t.user?.lastName}
                    <span className="block text-xs text-slate-400">
                      {t.user?.email}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {t.title}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-xs font-bold rounded">
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(t.dueDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
