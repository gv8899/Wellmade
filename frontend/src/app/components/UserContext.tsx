"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { User, UserRole } from "@/types/auth";
import { parseJWT, hasRole, isAdmin, canEdit } from "@/utils/auth";
import { logger } from "@/utils/logger";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  // 權限檢查函數
  hasRole: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  canEdit: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // 當 NextAuth 會話變化時，同步更新我們的 UserContext
  useEffect(() => {
    console.log('UserContext: Session status:', status, 'Session:', !!session);
    
    // 處理載入狀態
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    // Session 載入完成，更新載入狀態
    setIsLoading(false);

    if (status === 'authenticated' && session?.user) {
      const backendToken = (session as any).backendToken;
      let userRoles: UserRole[] = [UserRole.USER]; // 預設角色
      
      // 優先從 session 中獲取角色資訊
      if ((session as any).roles) {
        userRoles = (session as any).roles;
        console.log('UserContext: Got roles from session:', userRoles);
      }
      // 如果 session 中沒有角色，嘗試從 JWT token 解析
      else if (backendToken) {
        try {
          const payload = parseJWT(backendToken);
          if (payload && payload.roles) {
            userRoles = payload.roles;
            console.log('UserContext: Got roles from JWT:', userRoles);
          }
        } catch (error) {
          console.error('Failed to parse JWT token:', error);
        }
      }
      
      // 從 NextAuth 會話中獲取用戶資訊
      const userData = {
        id: (session as any).userId,
        name: session.user.name || 'User',
        email: session.user.email || '',
        roles: userRoles,
        token: backendToken,
        firstName: (session as any).firstName,
        lastName: (session as any).lastName,
        picture: session.user.image || undefined,
      };
      
      console.log('UserContext: Setting user data:', userData);
      setUser(userData);
      
      // 設置日誌器的用戶ID
      if (userData.id) {
        logger.setUserId(userData.id);
        // 不記錄用戶登入到後端，這是正常業務流程，不是錯誤
        if (process.env.NODE_ENV === 'development') {
          console.log('👤 用戶登入:', { userId: userData.id, email: userData.email });
        }
      }
      
      // 檢查是否是新登入的會話（透過localStorage標記來判斷）
      const hasShownLoginToast = localStorage.getItem('hasShownLoginToast');
      if (!hasShownLoginToast) {
        toast.success('登入成功');
        localStorage.setItem('hasShownLoginToast', 'true');
        
        // 設定一個定時器，在一段時間後清除標記，以便下次登入時能再次顯示提示
        setTimeout(() => {
          localStorage.removeItem('hasShownLoginToast');
        }, 3000); // 3秒後清除，確保不會重複顯示
      }
    } else if (status === 'unauthenticated') {
      // 只有在確認未認證時才清除用戶資料
      console.log('UserContext: Clearing user data - unauthenticated');
      setUser(null);
      localStorage.removeItem('hasShownLoginToast');
    }
  }, [session, status]);

  // 保持原有的 login 函數，同時也支援使用 NextAuth
  const login = (user: User) => {
    setUser(user);
    // 這裡不需要調用 signIn，因為通常這個函數是在使用傳統方式登入成功後才會被調用
  };
  
  // 登出時同時調用 NextAuth 的 signOut
  const logout = async () => {
    const currentUserId = user?.id;
    // 不記錄用戶登出到後端，這是正常業務流程，不是錯誤
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 用戶登出:', { userId: currentUserId });
    }
    
    setUser(null);
    await signOut({ redirect: false }); // 不自動重定向，讓應用自行處理導航
    toast.success('已成功登出', {
      duration: 3000
    });
  };

  // 權限檢查函數
  const checkRole = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    return hasRole(user.roles, requiredRoles);
  };

  const checkIsAdmin = () => {
    if (!user) return false;
    return isAdmin(user.roles);
  };

  const checkCanEdit = () => {
    if (!user) return false;
    return canEdit(user.roles);
  };

  return (
    <UserContext.Provider value={{ 
      user,
      isLoading,
      login, 
      logout,
      hasRole: checkRole,
      isAdmin: checkIsAdmin,
      canEdit: checkCanEdit
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser 必須在 UserProvider 內使用");
  return ctx;
}
