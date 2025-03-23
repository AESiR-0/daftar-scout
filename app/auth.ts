import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    idToken?: string;
    accessToken?: string;
    status?: 'authenticated' | 'unauthenticated' | 'loading'
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

    async jwt({ token, account, session }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
        session.id_token = account.id_token
        console.log(account.id_token);

      }
      return token;
    },

    async session({ session }) {
      return session;
    },

    async signIn() {
      return true
    },
  },
});


