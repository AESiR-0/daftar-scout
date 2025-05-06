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
import { createDemoContent } from "@/lib/utils/createDemoScoutAndPitch";

const ALLOWED_EMAILS = [
  "workbyprat@gmail.com",
  "pratiechellani@gmail.com",
  "ladraunak@gmail.com",
  "shuklarohit2105@gmail.com",
  "tech.kaushalya1@gmail.com",
  "daftarosbackup@gmail.com"
];

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
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          prompt: "consent",
          access_type: "offline",
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
      if (!user.email || !account) return false;

      // Check if the email is in the allowed list
      if (!ALLOWED_EMAILS.includes(user.email)) {
        throw new Error("You cannot proceed, please have some patience and wait for the launch");
      }

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
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            type: "oauth",
          });
        }
        
        // Create demo content for existing user if they don't have it
        await createDemoContent(userId);
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
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          type: "oauth",
        });
        
        // Create demo content for the new user once they set their role
        // Note: We can't create demo content here because the user role is still "temp"
        // Demo content will be created when the user updates their role

        return true;
      }

      return true;
    },

    async session({ session, token }) {
      return session;
    },

    async jwt({ token }) {
      return token;
    },
  },
});
