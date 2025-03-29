import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import { checkIfNewUser } from "@/lib/helper/checkNewUser";
import { insertCriticalPath } from "@/lib/helper/criticalPath";

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
  }, session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Extract role from URL
      const roleMatch = baseUrl.includes('investor') ? "investor" : 'founder'
      return url;
    },

    async jwt({ token, account, session }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
        session.id_token = account.id_token;
        console.log(account.id_token);

      }
      return token;
    },

    async session({ session }) {

      return session;
    },
    async signIn({ profile }) {

      if (!profile?.email)
        return false

      const { isNew, id } = await checkIfNewUser(profile.email);

      // Example: Redirect based on whether it's a new user
      if (isNew) {
        return "/sign-up"; // Redirect new users to a welcome page
      }
      try {
        await insertCriticalPath(id);
        return true; // Proceed with default behavior
      }
      catch (e) {
        console.error(e);
        return false;
      }
    },
  },
});



