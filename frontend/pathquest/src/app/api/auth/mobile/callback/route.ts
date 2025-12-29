import { NextRequest, NextResponse } from "next/server";

/**
 * Mobile OAuth Callback Handler
 * 
 * This route acts as an intermediary for native app OAuth:
 * 1. Strava redirects here with the authorization code
 * 2. We redirect to the native app's deep link with the code
 * 
 * Flow:
 * Native App -> Strava OAuth -> https://pathquest.app/api/auth/mobile/callback?code=...
 *            -> pathquest://auth/callback?code=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get the authorization code from Strava
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");
  
  // Build the native app deep link
  const nativeScheme = "pathquest";
  const nativePath = "auth/callback";
  
  // Construct query params to pass to native app
  const params = new URLSearchParams();
  
  if (code) {
    params.set("code", code);
  }
  if (error) {
    params.set("error", error);
  }
  if (state) {
    params.set("state", state);
  }
  if (scope) {
    params.set("scope", scope);
  }
  
  // Redirect to native app
  const nativeUrl = `${nativeScheme}://${nativePath}?${params.toString()}`;
  
  // Return an HTML page that redirects to the native app
  // This is more reliable than a 302 redirect for custom schemes
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Redirecting to PathQuest...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #1a1a1a;
            color: #ffffff;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          p {
            color: #888;
            margin-bottom: 2rem;
          }
          a {
            color: #4D7A57;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border: 1px solid #4D7A57;
            border-radius: 8px;
            display: inline-block;
          }
          a:hover {
            background: #4D7A57;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Redirecting to PathQuest...</h1>
          <p>If the app doesn't open automatically, tap the button below.</p>
          <a href="${nativeUrl}">Open PathQuest</a>
        </div>
        <script>
          // Attempt to redirect immediately
          window.location.href = "${nativeUrl}";
        </script>
      </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

