import { Suspense } from "react";
import { LoginClient } from "@/app/login/[role]/login-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Login({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const session = await auth();
  if (session) {
    return redirect(`/${role}`); 
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md w-full">
            <Skeleton className="h-9 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full mx-auto" />
            <div className="p-8 rounded-lg shadow-sm">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <LoginClient role={role} />
    </Suspense>
  );
}