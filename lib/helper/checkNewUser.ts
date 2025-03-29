import { db } from '@/backend/database'
import { eq } from 'drizzle-orm';
import { users } from '@/backend/drizzle/models/users'

export async function checkIfNewUser(userMail: string) {
    const existingAccounts = await db
        .select()
        .from(users)
        .where(eq(users.email, userMail))
        .limit(1);

    return { isNew: existingAccounts.length === 0, id: existingAccounts[0].id };
}