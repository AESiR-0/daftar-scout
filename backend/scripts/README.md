# Demo Content Scripts

This directory contains scripts for creating demo content (daftars, scouts, and pitches) for users in the DaftarOS system.

## Available Scripts

### Create Demo Content for All Users

This script creates demo content for all existing users based on their role:

- For investors: Creates a demo daftar, scout, and pitch
- For founders: Creates a demo scout and pitch

```bash
# Run using npm
npm run create-demo-content

# Or using pnpm
pnpm create-demo-content
```

## How It Works

1. The script fetches all users from the database
2. For each user, it checks their role and creates appropriate demo content:
   - For investors: Creates a demo daftar, then a scout linked to that daftar, and a pitch linked to the scout
   - For founders: Creates a demo scout and a pitch linked to that scout
3. Each scout includes 7 sample questions
4. For founders, they are automatically added to the pitch team

## Automatic Creation for New Users

New users will automatically get demo content created for them when they update their role from "temp" to either "founder" or "investor" during the onboarding process.

## Utility Function

The core functionality is provided by the `createDemoContent` utility function in `lib/utils/createDemoScoutAndPitch.ts`, which can be imported and used anywhere in the codebase:

```typescript
import { createDemoContent } from "@/lib/utils/createDemoScoutAndPitch";

// Create demo content for a user
await createDemoContent(userId);
``` 