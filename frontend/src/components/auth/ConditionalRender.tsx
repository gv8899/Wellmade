"use client";
import { useUser } from "@/app/components/UserContext";
import { UserRole } from "@/types/auth";
import { ReactNode } from "react";

interface ConditionalRenderProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  fallback?: ReactNode;
}

/**
 * 條件渲染組件 - 根據用戶權限顯示內容
 */
export function ConditionalRender({ 
  children, 
  requiredRoles = [], 
  requireAuth = false,
  fallback = null 
}: ConditionalRenderProps) {
  const { user, hasRole } = useUser();

  // 如果需要認證但用戶未登入
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  // 如果需要特定角色但用戶沒有權限
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 僅管理員可見組件
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ConditionalRender requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </ConditionalRender>
  );
}

/**
 * 已登入用戶可見組件
 */
export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ConditionalRender requireAuth fallback={fallback}>
      {children}
    </ConditionalRender>
  );
}

/**
 * 未登入用戶可見組件
 */
export function GuestOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { user } = useUser();
  
  if (user) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}