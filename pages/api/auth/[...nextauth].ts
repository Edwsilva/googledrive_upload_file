import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google"


export default NextAuth({
  secret: process.env.SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
          access_type: "offline",
          prompt: "consent",
        },
      },
      
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
       
      if (!token.accessToken) {
        console.error("Access Token não encontrado no token.");
      } else {
        console.log("Access Token presente:", token.accessToken);
      }
      if (account) {
        console.log('Estou no account ', account)
        token.accessToken = account.access_token;
       
      token.refreshToken = account.refresh_token;
      token.expiresAt = account.expires_at;
        console.log('Access Token do Google:', token.accessToken);
      }
      return token;
    },

    async session({ session, token }) {
      console.log('Estou no async session')
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      console.log("Sessionnnn ", session)
      return session;
    },
  },
});
