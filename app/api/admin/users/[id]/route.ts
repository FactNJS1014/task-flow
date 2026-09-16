import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { role, status } = await req.json();

    const userToUpdate = await db.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Protection Check สำหรับ Admin คนสุดท้าย
    if (
      userToUpdate.role === "ADMIN" &&
      (role === "USER" || status === "INACTIVE")
    ) {
      const activeAdminCount = await db.user.count({
        where: { role: "ADMIN", status: "ACTIVE" },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot deactivate or demote the last active admin",
          },
          { status: 400 },
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { role, status },
    });

    await db.auditLog.create({
      data: {
        userId: auth.session!.id,
        action: "ADMIN_UPDATE_USER",
        entity: "User",
        entityId: id,
        metadata: { role, status },
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update user" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const userToDelete = await db.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (userToDelete.role === "ADMIN") {
      const activeAdminCount = await db.user.count({
        where: { role: "ADMIN", status: "ACTIVE" },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Cannot delete the last active admin" },
          { status: 400 },
        );
      }
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: auth.session!.id,
        action: "ADMIN_DELETE_USER",
        entity: "User",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}
