import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

// 導出 authOptions 以便其他 API 路由能夠使用
export const authOptions: NextAuthOptions = {

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('NextAuth authorize called:', { 
          hasEmail: !!credentials?.email, 
          hasPassword: !!credentials?.password 
        });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth authorize: Missing credentials');
          return null;
        }

        try {
          // 向後端 API 發送登入請求
          const backendUrl = process.env.BACKEND_URL;
          console.log('NextAuth authorize: Using BACKEND_URL:', backendUrl);
          
          if (!backendUrl) {
            console.error('BACKEND_URL environment variable is required');
            return null;
          }
          
          const requestBody = {
            email: credentials.email,
            password: credentials.password,
          };
          console.log('NextAuth authorize: Sending request to backend:', requestBody);
          
          const response = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          console.log('NextAuth authorize: Backend response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('NextAuth authorize: Backend login successful:', {
              hasUser: !!data.user,
              hasToken: !!data.access_token,
              userId: data.user?.id,
              userRoles: data.user?.roles
            });
            
            // 返回用戶資料，NextAuth 會將其存儲在 session 中
            const userObject = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.username || data.user.firstName || data.user.email,
              backendToken: data.access_token,
              roles: data.user.roles,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              picture: data.user.picture,
            };
            
            console.log('NextAuth authorize: Returning user object:', userObject);
            return userObject;
          } else {
            const errorText = await response.text();
            console.error('NextAuth authorize: Backend login failed:', response.status, errorText);
            return null;
          }
        } catch (error) {
          console.error('NextAuth authorize: Error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, user }) => {
      console.log('NextAuth JWT callback called:', { 
        hasAccount: !!account, 
        hasUser: !!user,
        provider: account?.provider,
        userId: user?.id,
        tokenSub: token.sub 
      });
      
      // Initial sign in
      if (account && user) {
        console.log('NextAuth: Processing initial sign in');
        // 如果是 Credentials Provider，直接使用後端返回的資料
        if (account.provider === 'credentials') {
          console.log('NextAuth: Processing credentials login', {
            userId: user.id,
            roles: (user as any).roles,
            backendToken: !!(user as any).backendToken
          });
          
          token.backendToken = (user as any).backendToken;
          token.userId = user.id;
          token.roles = (user as any).roles;
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.picture = (user as any).picture;
          token.provider = 'credentials';
          
          console.log('NextAuth: Token updated:', {
            hasBackendToken: !!token.backendToken,
            userId: token.userId,
            roles: token.roles
          });
        }
        // 如果是 Google Provider，將資料同步到後端
        else if (account.provider === 'google' && user.email) {
          try {
            console.log('正在將用戶資料同步到後端...', { email: user.email, name: user.name, image: user.image });
            // 發送使用者資料到後端 API
            const backendUrl = process.env.BACKEND_URL;
            if (!backendUrl) {
              console.error('BACKEND_URL environment variable is required');
              return token;
            }
            const response = await fetch(`${backendUrl}/auth/oauth-sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                picture: user.image,
                provider: 'google'
              }),
            });
            
            if (response.ok) {
              const backendData = await response.json();
              console.log('用戶資料已同步到後端:', backendData);
              
              // 將後端返回的資料（包含 JWT 等）合併到 token 中
              if (backendData.accessToken) {
                token.backendToken = backendData.accessToken;
                token.backendUser = backendData.user;
              }
            } else {
              console.error('同步用戶資料到後端失敗:', await response.text());
            }
          } catch (error) {
            console.error('同步用戶資料到後端出錯:', error);
          }
          
          // 保存 Google OAuth 資訊
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          token.provider = account.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('NextAuth session callback called:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenUserId: token.userId,
        tokenRoles: token.roles,
        hasBackendToken: !!token.backendToken
      });
      
      // 將資訊從 token 傳到 session 中
      (session as any).accessToken = token.accessToken;
      (session as any).idToken = token.idToken;
      (session as any).provider = token.provider;
      (session as any).userId = token.userId;
      (session as any).roles = token.roles;
      (session as any).firstName = token.firstName;
      (session as any).lastName = token.lastName;
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken;
      }
      if (token.backendUser) {
        (session as any).backendUser = token.backendUser;
      }
      
      console.log('NextAuth: Session prepared:', {
        userId: (session as any).userId,
        roles: (session as any).roles,
        hasBackendToken: !!(session as any).backendToken
      });
      
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour - 定期更新 session
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 创建處理程序實例
const handler = NextAuth(authOptions);

// 導出 GET 和 POST 處理程序
export { handler as GET, handler as POST };
