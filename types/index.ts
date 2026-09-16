export type Role = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type NotificationType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "TASK_REMINDER"
  | "TASK_OVERDUE"
  | "SYSTEM";

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 5. Notification Item Interface (ที่ใช้ใน Navbar และ Notification Center)
export interface NotificationItem {
  id: string;
  userId: string;
  taskId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 6. Audit Log Interface (สำหรับ Admin & System Logs)
export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}
