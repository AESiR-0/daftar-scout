import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    idToken?: string
    accessToken?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        scope: "openid email profile",
        response_type: "code",
      }
    }
  }),
  ],
  pages: {
    signIn: `/login`,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Extract role from URL
      const roleMatch = baseUrl.includes('investor') ? "investor" : 'founder'
      return '/' + roleMatch;
    },

    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.idToken) {
        session.idToken = token.idToken as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      return true
    },
  },
});


