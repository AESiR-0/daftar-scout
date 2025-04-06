import { Suspense } from "react";
import LoginLoading from "./loading";
import { LoginClient } from "@/app/login/[role]/login-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Login({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const session = await auth();
  if (session) {
    return redirect(`/${role}`); // Redirect to home if already logged in
  }

  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginClient role={role} />
    </Suspense>
  );
}
