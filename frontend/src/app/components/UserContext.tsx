"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export interface User {
  name: string;
  email: string;
  token?: string; // JWT token
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status } = useSession();

  // 當 NextAuth 會話變化時，同步更新我們的 UserContext
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // 從 NextAuth 會話中獲取用戶資訊
      setUser({
        name: session.user.name || 'User',
        email: session.user.email || '',
        // 如果你有將 token 添加到 NextAuth session，可以從這裡獲取
        token: (session as any).token || undefined
      });
    } else if (status === 'unauthenticated') {
      // 如果沒有會話，則用戶未登入
      setUser(null);
    }
  }, [session, status]);

  // 保持原有的 login 函數，同時也支援使用 NextAuth
  const login = (user: User) => {
    setUser(user);
    // 這裡不需要調用 signIn，因為通常這個函數是在使用傳統方式登入成功後才會被調用
  };
  
  // 登出時同時調用 NextAuth 的 signOut
  const logout = async () => {
    setUser(null);
    await signOut({ redirect: false }); // 不自動重定向，讓應用自行處理導航
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser 必須在 UserProvider 內使用");
  return ctx;
}
