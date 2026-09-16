"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User, Menu, X, Check, CheckCheck } from "lucide-react";
import { UserSession, NotificationItem } from "@/types";

interface NavbarProps {
  user: UserSession;
  onToggleMobileSidebar: () => void;
}

export function Navbar({ user, onToggleMobileSidebar }: NavbarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showBellMenu, setShowBellMenu] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowBellMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");

      // 📌 ตรวจสอบ res.ok ก่อนแปลงเป็น json
      if (!res.ok) {
        console.warn("Notifications API returned status:", res.status);
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setNotifications((json.data.notifications || []).slice(0, 5));
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
              T
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                Task<span className="text-blue-600">Flow</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:inline">
                Smart Todo
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Notification Bell & User Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full relative transition"
              aria-label="View Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showBellMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs transition ${
                          n.isRead
                            ? "bg-white opacity-75"
                            : "bg-blue-50/40 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-2xl">
                  <Link
                    href="/notifications"
                    onClick={() => setShowBellMenu(false)}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-block py-1"
                  >
                    View Notification Center &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info & Logout Button */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 hover:opacity-80 transition group"
            >
              <div className="w-9 h-9 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center text-xs border border-slate-200 group-hover:border-blue-400">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {user.role}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
