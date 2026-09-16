"use client";

import React, { useEffect, useState } from "react";
import { CheckCheck, Bell } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    fetchNotifications();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notification Center
          </h1>
          <p className="text-slate-500 text-sm">
            Stay updated with your task activities and system alerts.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
        >
          <CheckCheck className="w-4 h-4 text-slate-500" /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          No notifications yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 transition ${
                n.isRead ? "bg-white" : "bg-blue-50/40 font-medium"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${n.isRead ? "bg-transparent" : "bg-blue-600"}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {n.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
