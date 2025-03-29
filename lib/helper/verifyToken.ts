import { decode } from "next-auth/jwt";


export async function verifyJWT(token: string) {
    const secret = process.env.AUTH_SECRET as string
    const payload = await decode({ token, secret })
    return payload
}