import ClientSessionProvider from "./client-session";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/navbar/side-nav";
import { TopNav } from "@/components/navbar/top-nav";
import { SearchProvider } from "@/lib/context/search-context";
import { BookmarkProvider } from "@/lib/context/bookmark-context";
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
  const session = await auth();
  if (!session?.user) {
    redirect("/login/founder");
  }

  const user = await getUserRole(session.user.email ?? "");
  
  if (user.role === "temp") {
    redirect("/sign-up/complete");
  }
  if (user.role !== "founder") {
    redirect("/investor");
  }

  return (
    <BookmarkProvider>
      <SearchProvider>
        <ClientSessionProvider>
          <ErrorBoundary>
            <div className="flex font-poppins bg-[#0e0e0e]">
              <AppSidebar role="founder" />
              <div className="w-screen flex flex-col">
                <div className="px-10 border-b">
                  <TopNav role="founder" />
                </div>
                <div>{children}</div>
              </div>
            </div>
          </ErrorBoundary>
        </ClientSessionProvider>
      </SearchProvider>
    </BookmarkProvider>
  );
}
