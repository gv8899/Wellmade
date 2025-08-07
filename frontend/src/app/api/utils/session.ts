import { NextRequest } from 'next/server';

let authOptions: any = null;
let getServerSession: any = null;

// 動態導入以避免初始化問題
async function loadNextAuth() {
  if (!getServerSession) {
    const nextAuth = await import('next-auth');
    getServerSession = nextAuth.getServerSession;
  }
  
  if (!authOptions) {
    const authModule = await import('../auth/[...nextauth]/route');
    authOptions = authModule.authOptions;
  }
  
  return { getServerSession, authOptions };
}

/**
 * 安全獲取用戶會話，兼容本地和正式環境
 */
export async function getSafeSession() {
  try {
    const { getServerSession: getSession, authOptions: options } = await loadNextAuth();
    const session = await getSession(options);
    console.log('🔍 getSafeSession 結果:', {
      hasSession: !!session,
      sessionUser: session?.user?.email,
      hasBackendToken: !!(session as any)?.backendToken,
      backendTokenLength: (session as any)?.backendToken?.length
    });
    return session;
  } catch (error) {
    console.log('會話獲取失敗，繼續以訪客身份處理:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * 準備後端請求的 headers，包含授權和 Cookie
 */
export function prepareBackendHeaders(request: NextRequest, session: any) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 如果有會話，添加授權標頭
  if (session && session.backendToken) {
    headers.Authorization = `Bearer ${session.backendToken}`;
  }

  // 複製原始請求的 Cookie（保持 session 狀態）
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
    console.log('🍪 轉發 Cookie:', cookieHeader);
  } else {
    console.log('⚠️  無 Cookie 信息');
  }

  return headers;
}