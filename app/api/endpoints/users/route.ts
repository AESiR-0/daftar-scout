import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";

export const PATCH = auth(async (req) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      gender,
      dob,
      location,
      email,
      role,
    } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }
    const formattedDob = dob ? new Date(dob).toISOString().split("T")[0] : null; // Converts to "YYYY-MM-DD"

    const updatedUser = await db
      .update(users)
      .set({
        name: firstName,
        lastName: lastName,
        number: phoneNumber,
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
});
