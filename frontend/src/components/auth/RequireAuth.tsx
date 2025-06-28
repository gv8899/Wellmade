"use client";
import { useUser } from "@/app/components/UserContext";
import { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface RequireAuthProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * 路由保護組件 - 檢查用戶認證和角色權限
 */
export function RequireAuth({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  redirectTo = "/login"
}: RequireAuthProps) {
  const { user, hasRole, isLoading } = useUser();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('RequireAuth: Status check', { 
      status, 
      isLoading, 
      hasUser: !!user, 
      requiredRoles 
    });

    // 等待完全載入完成
    if (status === "loading" || isLoading) {
      return;
    }
    
    // 如果確認未登入（session 明確顯示 unauthenticated）
    if (status === "unauthenticated") {
      console.log('RequireAuth: Redirecting to login - no authentication');
      toast.error('請先登入');
      router.push(redirectTo);
      return;
    }
    
    // 如果 session 已認證但 UserContext 還沒載入用戶，等待
    if (status === "authenticated" && !user) {
      console.log('RequireAuth: Waiting for user data to load...');
      return;
    }

    // 如果需要特定角色但用戶沒有權限
    if (user && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      console.log('RequireAuth: Redirecting - insufficient roles');
      toast.error('您沒有權限訪問此頁面');
      router.push('/'); // 重定向到首頁
      return;
    }
  }, [user, hasRole, requiredRoles, router, redirectTo, status, isLoading]);

  // 如果正在載入，顯示載入中
  if (status === "loading" || isLoading) {
    return <>{fallback || <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}</>;
  }

  // 如果沒有登入，顯示 fallback 或 null
  if (status === "unauthenticated") {
    return <>{fallback}</>;
  }
  
  // 如果 session 已認證但用戶數據還沒載入，顯示載入中
  if (status === "authenticated" && !user) {
    return <>{fallback || <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}</>;
  }

  // 如果需要特定角色但用戶沒有權限
  if (user && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <>{fallback || <div className="p-4 text-center text-red-600">您沒有權限訪問此頁面</div>}</>;
  }

  // 用戶已登入且有權限
  return <>{children}</>;
}