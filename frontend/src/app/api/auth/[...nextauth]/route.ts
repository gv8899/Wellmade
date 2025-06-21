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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 向後端 API 發送登入請求
          const response = await fetch('http://localhost:3003/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Backend login successful:', data);
            
            // 返回用戶資料，NextAuth 會將其存儲在 session 中
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.username || data.user.firstName || data.user.email,
              backendToken: data.access_token,
              roles: data.user.roles,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              picture: data.user.picture,
            };
          } else {
            console.error('Backend login failed:', response.status, await response.text());
            return null;
          }
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        // 如果是 Credentials Provider，直接使用後端返回的資料
        if (account.provider === 'credentials') {
          token.backendToken = (user as any).backendToken;
          token.userId = user.id;
          token.roles = (user as any).roles;
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.picture = (user as any).picture;
          token.provider = 'credentials';
        }
        // 如果是 Google Provider，將資料同步到後端
        else if (account.provider === 'google' && user.email) {
          try {
            console.log('正在將用戶資料同步到後端...', { email: user.email, name: user.name, image: user.image });
            // 發送使用者資料到後端 API
            const response = await fetch('http://localhost:3003/auth/oauth-sync', {
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
