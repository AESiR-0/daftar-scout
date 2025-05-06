import { db } from "../database";
import { users } from "../drizzle/models/users";
import { createDemoContent } from "../../lib/utils/createDemoScoutAndPitch";

async function createDemoContentForAllUsers() {
  try {
    console.log("Starting to create demo content for all users...");
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);
    
    let createdCount = 0;
    
    for (const user of allUsers) {
      const result = await createDemoContent(user.id);
      if (result) {
        createdCount++;
      }
    }
    
    console.log(`Successfully created demo content for ${createdCount} users`);
  } catch (error) {
    console.error("Error creating demo content:", error);
  }
}

// Run the function
createDemoContentForAllUsers()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 