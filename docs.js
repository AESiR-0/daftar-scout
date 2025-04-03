import fs from "fs/promises";
import path from "path";

const endpoints = [
  "/feature-request/",
  "feature-tracking/",
  "/getAllLanguages/",
  "/listing-time/",
  "/mapping/",
  "/pitch/",
  "/pitch/founder/answers/",
  "/pitch/founder/delete/",
  "/pitch/founder/offer/",
  "/pitch/founder/details/",
  "/pitch/founder/offer/",
  "/pitch/founder/pitch/",
  "/pitch/founder/questions/",
  "/pitch/founder/team/",
  "/pitch/investor/analysis/",
  "/pitch/investor/details/",
  "/pitch/investor/note/",
  "/pitch/investor/offer/",
  "/pitch/investor/offer/action/",
  "/pitch/investor/team/",
  "/reports/",
  "/reports/status",
  

  // Add all 69 endpoints here
];

const BASE_URL = "http://localhost:3000/api/endpoints"; // Change this to your API base URL
const SCHEMA_DIR = path.join(process.cwd(), "public", "schemas");
const FAILED_LOG_PATH = path.join(SCHEMA_DIR, "failed-endpoints.log");

// Function to determine the type of a value
function getType(value) {
  if (Array.isArray(value))
    return `Array<${value.length ? getType(value[0]) : "unknown"}>`;
  return typeof value;
}

// Ensure directory exists
async function ensureDirExists() {
  try {
    await fs.mkdir(SCHEMA_DIR, { recursive: true });
  } catch (error) {
    console.error(`❌ Failed to create schema directory:`, error.message);
  }
}

// Fetch and generate schemas
async function fetchAndGenerateSchemas() {
  let failedEndpoints = [];

  await ensureDirExists();

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();

      // Extract schema
      const schema = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, getType(value)])
      );

      // Convert endpoint name to a valid filename
      const filename = endpoint.replace(/\//g, "_").slice(1); // e.g., "api_user"

      // Save JSON Schema
      const jsonSchema = JSON.stringify(schema, null, 2);
      await fs.writeFile(path.join(SCHEMA_DIR, `${filename}.json`), jsonSchema);

      // Save Markdown Schema
      let markdownSchema = `# ${endpoint} Schema\n\n| Field | Type |\n|---|---|\n`;
      markdownSchema += Object.entries(schema)
        .map(([key, type]) => `| \`${key}\` | \`${type}\` |`)
        .join("\n");
      await fs.writeFile(
        path.join(SCHEMA_DIR, `${filename}.md`),
        markdownSchema
      );

      console.log(`✅ Saved schema: ${filename}.json & ${filename}.md`);
    } catch (error) {
      console.error(`❌ Failed to fetch ${endpoint}:`, error.message);
      failedEndpoints.push(`${endpoint}: ${error.message}`);
    }
  }

  // Save failed endpoints log
  if (failedEndpoints.length > 0) {
    await fs.writeFile(FAILED_LOG_PATH, failedEndpoints.join("\n"));
    console.log(
      `⚠️ Some endpoints failed. Check 'failed-endpoints.log' in ${SCHEMA_DIR}.`
    );
  } else {
    console.log("🎉 All endpoints processed successfully!");
  }
}

// Run the script
fetchAndGenerateSchemas();
