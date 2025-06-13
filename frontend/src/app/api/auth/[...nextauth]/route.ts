import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        // 當使用者首次登入時，將資料同步到後端
        if(user.email) {
          try {
            console.log('正在將用戶資料同步到後端...', { email: user.email, name: user.name, image: user.image });
            // 發送使用者資料到後端 API
            // 直接使用完整的 URL 而非相對路徑，防止被 next.config.js 中的代理規則攝獲
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
        }
        
        // 保存 Google OAuth 資訊
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // 將資訊從 token 傳到 session 中
      (session as any).accessToken = token.accessToken;
      (session as any).idToken = token.idToken;
      (session as any).provider = token.provider;
      // if (token.backendToken) {
      //   (session as any).backendToken = token.backendToken;
      // }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
