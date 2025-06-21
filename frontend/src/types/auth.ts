// 用戶角色枚舉 - 與後端保持一致
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
}

// 擴展的用戶界面
export interface User {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
  token?: string; // JWT token
  firstName?: string;
  lastName?: string;
  picture?: string;
}

// JWT Token Payload 界面
export interface JWTPayload {
  sub: string; // 用戶 ID
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

// 權限檢查函數類型
export type PermissionChecker = (requiredRoles: UserRole[]) => boolean;

// 路由保護配置
export interface RouteGuard {
  path: string;
  requiredRoles: UserRole[];
  redirectTo?: string;
}