import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";

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
    const formattedDob = dob ? new Date(dob).toISOString().split("T")[0] : null; // Converts to "YYYY-MM-DD"
    console.log(
      "Body data",
      name,
      lastName,
      formattedDob,
      phoneNumber,
      location,
      email
    );

    const updatedUser = await db
      .update(users)
      .set({
        name: name,
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
}
