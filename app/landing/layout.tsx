import { RootSidebar } from "@/components/navbar/root-sidebar";
import { TopNavRoot } from "@/components/navbar/top-nav-root";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication
  const session = await auth();
  let userRole: string | null = null;
  if (session?.user?.email) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email));
    if (user?.role) {
      userRole = user.role;
    }
  }
  if (userRole) {
    redirect(`/${userRole.toLowerCase()}`);
  }

  return (
    <div className="flex min-h-screen h-full">
      <RootSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavRoot />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 