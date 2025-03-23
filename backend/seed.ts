import { db } from './database';
import { schema } from './drizzle/schema';

async function seed() {
    try {
        // Example: Seeding users table
        await db.insert(schema.users).values([
            { userId: '1', name: 'Alice', email: 'alice@example.com' },
            { userId: '2', name: 'Bob', email: 'bob@example.com' },
        ]);

        // Example: Seeding scouts table
        await db.insert(schema.scouts).values([
            { scoutId: '1', name: 'Scout One', region: 'North' },
            { scoutId: '2', name: 'Scout Two', region: 'South' },
        ]);

        // Add more seeding logic for other models as needed
        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.end(); // Close the database connection
    }
}

seed(); 