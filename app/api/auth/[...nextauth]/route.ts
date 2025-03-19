import NextAuth from "next-auth";
import type { DefaultSession, NextAuthOptions, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
    interface Session {
        idToken?: string;
        userAuth: User;
    }

    interface User extends DefaultUser {
        role?: "investor" | "founder" | null;
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
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
            // Pass the id_token to the token object
            if (account?.id_token) {
                token.idToken = account.id_token;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.role = Cookies.get('user_role') as "investor" | "founder" | null;
                session.idToken = token.idToken as string;
            }
            return session;
        },

        async signIn({ user: UserAuth, account }) {
            if (account?.id_token) {
                try {
                    // Call your custom login endpoint
                    const role = localStorage.getItem('user-role')
                    console.log(Cookies.get("user_role"), "before call");
                    const response = await fetch(`http://127.0.0.1:8000/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            token: account.id_token,
                            user_type: role
                        }),
                    });
                    const data = await response.json();
                    console.log(data);

                    // You can store additional data from your API response if needed
                    return true;
                } catch (error) {
                    console.log('error')
                    console.error('Login error:', error);
                    return false;
                }
            }
            return false;
        },
    },
});

export { handler as GET, handler as POST };
