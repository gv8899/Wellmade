import { UserRole, JWTPayload } from '@/types/auth';

/**
 * 檢查用戶是否具有所需角色
 * @param userRoles 用戶擁有的角色
 * @param requiredRoles 所需的角色（任一即可）
 * @returns 是否有權限
 */
export function hasRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * 檢查用戶是否為管理員
 * @param userRoles 用戶角色
 * @returns 是否為管理員
 */
export function isAdmin(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, [UserRole.ADMIN]);
}

/**
 * 檢查用戶是否為編輯者或管理員
 * @param userRoles 用戶角色
 * @returns 是否有編輯權限
 */
export function canEdit(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, [UserRole.ADMIN, UserRole.EDITOR]);
}

/**
 * 解析 JWT Token 獲取用戶資訊
 * @param token JWT Token
 * @returns 解析後的 payload
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * 檢查 JWT Token 是否過期
 * @param token JWT Token
 * @returns 是否過期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * 獲取角色的顯示名稱
 * @param role 角色
 * @returns 顯示名稱
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    [UserRole.ADMIN]: '管理員',
    [UserRole.EDITOR]: '編輯者',
    [UserRole.USER]: '一般用戶',
  };
  
  return roleNames[role] || role;
}

/**
 * 獲取用戶所有角色的顯示名稱
 * @param roles 用戶角色陣列
 * @returns 顯示名稱陣列
 */
export function getUserRoleDisplayNames(roles: UserRole[]): string[] {
  return roles.map(role => getRoleDisplayName(role));
}