import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

let role: string | null = null;
const handler = NextAuth({
    providers: [
        GoogleProvider(
            {
                authorization: {
                    params: {
                        prompt: "consent",
                        access_type: "offline",
                        scope: "openid email profile",
                        response_type: "code",
                    },
                },
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            }
        ),
    ], pages: {
        signIn: `/login`,
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            role = url.split("/")[1];
            return url.startsWith(baseUrl) ? url : baseUrl + url;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.role = role as "investor" | "founder" | null;
            }
            return session;
        },
        async signIn({ user, account }) {
            console.log(user);
            console.log(account);
            return true
        },
        async jwt({ token, user, account }) {
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        }
    },

})

export { handler as GET, handler as POST }
