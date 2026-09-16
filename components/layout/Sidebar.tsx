"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  User,
  ShieldCheck,
  Users,
  ListOrdered,
  X,
  Plus,
} from "lucide-react";
import { UserSession } from "@/types";

interface SidebarProps {
  user: UserSession;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCreateModal?: () => void; // 📌 เพิ่ม prop สำหรับเปิด Modal
}

export function Sidebar({
  user,
  mobileOpen,
  onCloseMobile,
  onOpenCreateModal,
}: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const adminNavItems = [
    { label: "Overview", href: "/admin", icon: ShieldCheck },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "System Tasks", href: "/admin/tasks", icon: ListOrdered },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shrink-0 ${
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 md:hidden">
            <span className="font-bold text-slate-900 text-lg">
              Menu Navigation
            </span>
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📌 เปลี่ยนเป็นปุ่มกด trigger เปิด Task Form Modal */}
          <div>
            <button
              onClick={() => {
                onCloseMobile();
                if (onOpenCreateModal) onOpenCreateModal();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Create New Task</span>
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Main Navigation
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {user.role === "ADMIN" && (
            <div className="space-y-1 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider px-3 mb-2 block">
                Admin Controls
              </span>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-50 text-purple-600 font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-slate-400"}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            TaskFlow SaaS v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
