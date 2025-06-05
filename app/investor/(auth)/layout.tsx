import { TopNav } from "@/components/navbar/top-nav";
import ClientSessionProvider from "./client-session";
import { AppSidebar } from "@/components/navbar/side-nav";
import { DaftarProvider } from "@/lib/context/daftar-context";
import { auth } from "@/auth";
import { BookmarkProvider } from "@/lib/context/bookmark-context";
import { redirect } from "next/navigation";
import { SearchProvider } from "@/lib/context/search-context";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { ErrorBoundary } from "@/components/error-boundary";
import { cache } from 'react';

// Cache the user role check
const getUserRole = cache(async (email: string) => {
  return db
    .select({ role: users?.role })
    .from(users)
    .where(eq(users?.email, email))
    .then((res) => res[0]);
});

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the user is authenticated
  const session = await auth();
  console.log("[Investor Layout] Session:", session);
  if (!session?.user) {
    console.error("[Investor Layout] No session user, redirecting to /login/investor");
    redirect("/login/investor");
  }
  const user = await getUserRole(session.user.email ?? "");
  console.log("[Investor Layout] User from DB:", user);

  if (!user || !user.role) {
    // Fallback: If user is not found or role is missing, show an error
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-red-600">User role not found</h1>
          <p className="text-muted-foreground">Please contact support or try logging in again.</p>
        </div>
      </div>
    );
  }

  if (user.role === "temp") {
    console.warn("[Investor Layout] User role is temp, redirecting to /sign-up/complete");
    redirect("/sign-up/complete");
  }
  if (user.role.toLowerCase() !== "investor") {
    console.warn(`{[Investor Layout] User role is not investor (got '${user.role}'), redirecting to /founder}`);
    redirect("/founder");
  }
  return (
    <BookmarkProvider>
      <SearchProvider>
        <DaftarProvider>
          <ClientSessionProvider>
            <ErrorBoundary>
              <div className="flex font-poppins bg-[#0e0e0e]">
                <AppSidebar role="investor" />
                <div className="w-screen flex flex-col">
                  <div className="px-10 border-b">
                    <TopNav role="investor" />
                  </div>
                  <div>{children}</div>
                </div>
              </div>
            </ErrorBoundary>
          </ClientSessionProvider>
        </DaftarProvider>
      </SearchProvider>
    </BookmarkProvider>
  );
}
