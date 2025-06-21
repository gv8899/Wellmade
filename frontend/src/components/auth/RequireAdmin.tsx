"use client";
import { UserRole } from "@/types/auth";
import { RequireAuth } from "./RequireAuth";
import { ReactNode } from "react";

interface RequireAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 管理員權限保護組件
 */
export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  return (
    <RequireAuth 
      requiredRoles={[UserRole.ADMIN]} 
      fallback={fallback}
      redirectTo="/login"
    >
      {children}
    </RequireAuth>
  );
}