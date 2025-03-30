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

  if (!user.length) {
    return <p className="text-red-600">User not found.</p>;
  }

  // Fetch all preferred languages for the user
  const userLanguagesList = await db
    .select({
      languageName: languages.language_name,
    })
    .from(userLanguages)
    .innerJoin(languages, eq(userLanguages.languageId, languages.id))
    .where(eq(userLanguages.userId, user[0].id));

  return (
    <UserProfileClient
      initialData={{ user: user[0], languages: userLanguagesList }}
      userMail={userMail}
    />
  );
}
