import { Suspense } from "react"
import LoginLoading from "./loading"
import { LoginClient } from "@/app/login/[role]/login-client"

export default async function Login({ params }: { params: Promise<{ role: string }> }) {
    const { role } = await params;

    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginClient role={role} />
        </Suspense>
    )
}
