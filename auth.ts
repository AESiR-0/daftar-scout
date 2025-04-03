import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/backend/database";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/backend/drizzle/models/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid email profile",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: `/login/*`,
  },
  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false; // Ensure the user has an email

      // Find an existing user by email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email));

      if (existingUser.length > 0) {
        const userId = existingUser[0].id;

        // Check if an OAuth account is already linked
        const linkedAccount = await db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, userId),
              eq(accounts.provider, account?.provider)
            )
          );

        if (linkedAccount.length === 0) {
          // If no linked account, insert it
          await db.insert(accounts).values({
            userId,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            type: "oidc", // Add the required 'type' field
          });
        }
      } else {
        // Create a new temp user if no user exists
        const [newUser] = await db
          .insert(users)
          .values({
            name: user.name as string,
            email: user.email,
            role: "temp", // Assign a temporary role
            image: user.image,
          })
          .returning();

        // Link the new user with the OAuth account
        await db.insert(accounts).values({
          userId: newUser.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          type: "oidc",
        });

        // Redirect to complete sign-up
        return true;
      }

      return true;
    },

    async session({ session }) {
      return session;
    },

    async jwt({ token }) {
      return token;
    },
  },
});
