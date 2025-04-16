import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
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
  return NextResponse.next();   
}