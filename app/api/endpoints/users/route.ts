import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/backend/database";
import {
  users,
  languages,
  userLanguages,
} from "@/backend/drizzle/models/users";

export async function PATCH(req: Request) {
  try {
    const { formData, email } = await req.json();
    console.log("Form state", formData, email);

    const { name, lastName, phoneNumber, gender, dob, location, role } =
      formData;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    const formattedDob = dob ? new Date(dob).toISOString().split("T")[0] : null;

    // Extract country code and number from phoneNumber
    let countryCode = null;
    let number = null;
    if (phoneNumber?.startsWith("+")) {
      const match = phoneNumber.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        countryCode = match[1];
        number = match[2].trim();
      }
    }

    // Fetch the userId based on the provided email
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const userId = user[0].id;

    // Fetch language IDs based on the provided language names in formData
    const languageIds = await Promise.all(
      (formData.languages || []).map(async (languageName: string) => {
        const language = await db
          .select({ id: languages.id })
          .from(languages)
          .where(eq(languages.language_name, languageName))
          .limit(1);

        return language.length ? language[0].id : null;
      })
    );

    // Filter out null values
    const validLanguageIds = languageIds.filter((id) => id !== null);

    // Insert new user-language mappings
    const userLanguageMappings = validLanguageIds.map((languageId) => ({
      userId: userId,
      languageId,
    }));

    if (userLanguageMappings.length > 0) {
      await db.insert(userLanguages).values(userLanguageMappings);
    }

    // Update user details
    const updatedUser = await db
      .update(users)
      .set({
        name: name,
        lastName: lastName,
        countryCode: countryCode,
        number: number,
        gender: gender,
        dob: formattedDob,
        location: location,
        role: role,
      })
      .where(eq(users.email, email))
      .returning();

    return new Response(
      JSON.stringify({ message: "Profile updated", user: updatedUser }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new Response(JSON.stringify({ error: "Failed to update profile" }), {
      status: 500,
    });
  }
}
