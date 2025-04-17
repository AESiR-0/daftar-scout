import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function middleware(req: NextRequest) {
  // 1. Check for mobile devices
  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );

  if (isMobile) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Desktop Only</title>
          <style>
            body { 
              background: #0e0e0e; 
              color: white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              font-family: Arial, sans-serif; 
            }
            .container { 
              text-align: center; 
              padding: 24px; 
            }
            h1 { 
              font-size: 1.5rem; 
              font-weight: bold; 
              margin-bottom: 16px; 
            }
            p { 
              color: #9ca3af; 
              max-width: 400px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Desktop Only</h1>
            <p>This application is only available on desktop devices. Please access it from a computer.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // 2. Get the requested URL path
  const { pathname } = req.nextUrl;

  // 3. Skip auth check for public routes
  const publicRoutes = ["/login", "/landing", "/"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. Check session
  const session = await auth();
  if (!session || !session.user?.email) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Get user and role from database
  const dbUser = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!dbUser.length) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = dbUser[0].role;

  // 6. Check if URL requires a specific role
  const isFounderRoute = pathname.includes("/founder/");
  const isInvestorRoute = pathname.includes("/investor/");

  if (isFounderRoute && userRole !== "founder") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isInvestorRoute && userRole !== "investor") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Allow authorized, non-mobile requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"], // Apply to all routes except Next.js internals
};