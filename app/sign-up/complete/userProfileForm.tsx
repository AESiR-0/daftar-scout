import { db } from "@/backend/database";
import {
  users,
  userLanguages,
  languages,
} from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import UserProfileClient from "./UserProfileClient";

export default async function UserProfileForm({
  userMail,
}: {
  userMail: string;
}) {
  // Fetch user data directly from the database
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, userMail))
    .limit(1);

  const userLanguage = await db
    .select({
      id: userLanguages.userId,
      languageId: userLanguages.languageId,
      userId: userLanguages.userId,
      languageName: languages.language_name,
    })
    .from(userLanguages)
    .innerJoin(languages, eq(userLanguages.languageId, languages.id))
    .where(eq(userLanguages.userId, user[0]?.id));
    
  if (!user.length) {
    return <p className="text-red-600">User not found.</p>;
  }

  return (
    <UserProfileClient
      initialData={(user[0], userLanguage)}
      userMail={userMail}
    />
  );
}
