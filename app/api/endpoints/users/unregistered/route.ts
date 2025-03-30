import { NextRequest, NextResponse } from "next/server";
import { getLocationViaIp } from "@/lib/helper/getLocation"; // Your custom location function
import { db } from "@/backend/database";
import { unregisteredUsers } from "@/backend/drizzle/models/users";

export async function GET(req: NextRequest) {
  try {
    // ✅ Get IP Address
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown";

    // ✅ Get location data from IP (Assuming you have an API function)
    const locationData = await getLocationViaIp(ip);

    // ✅ Get User-Agent Header
    const userAgent = req.headers.get("user-agent") || "Unknown";

    // ✅ Extract Browser, OS, and Device Information
    const { browser, os, device } = parseUserAgent(userAgent);

    const locationString = locationData.error
      ? "Location not found"
      : `${locationData.city}, ${locationData.region}, ${locationData.country}, ${locationData.latitude}, ${locationData.longitude}`;
    await db.insert(unregisteredUsers).values({
      ip,
      browser,
      os,
      device,
      userAgent,
      locationData: JSON.stringify(locationData),
    });
    return NextResponse.json(
      { ip, browser, os, device, userAgent, locationString },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user details" },
      { status: 500 }
    );
  }
}

// ✅ Pure TypeScript Function to Parse User-Agent
function parseUserAgent(userAgent: string) {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop"; // Default to Desktop

  // Detect Browser
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
    browser = "Opera";

  // Detect OS
  if (userAgent.includes("Windows NT 10")) os = "Windows 10";
  else if (userAgent.includes("Windows NT 6.1")) os = "Windows 7";
  else if (userAgent.includes("Mac OS X")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  // Detect Device Type
  if (userAgent.includes("Mobi")) device = "Mobile";
  else if (userAgent.includes("Tablet")) device = "Tablet";

  return { browser, os, device };
}
