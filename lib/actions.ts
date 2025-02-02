import { signOut } from "next-auth/react"

export const signOutAction = async () => {
    await signOut({ callbackUrl: '/' })
}