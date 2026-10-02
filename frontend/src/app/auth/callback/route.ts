import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // Clean redirection target (ensure relative path to prevent open redirect)
  const targetPath = next.startsWith("/") ? next : "/dashboard";

  // Handle provider cancellation or OAuth errors
  if (error || errorDescription || errorCode) {
    console.warn("[OAuth Callback] Provider returned error:", { error, errorCode, errorDescription });
    const loginUrl = new URL("/login", origin);

    if (error === "access_denied" || errorDescription?.includes("cancelled") || errorDescription?.includes("denied")) {
      loginUrl.searchParams.set("error", "Google sign-in was cancelled.");
    } else {
      loginUrl.searchParams.set("error", "Unable to complete Google sign-in. Please try again.");
    }

    return NextResponse.redirect(loginUrl);
  }

  // Handle authorization code exchange
  if (code) {
    try {
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("[OAuth Callback] Session exchange failed:", exchangeError.message);
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("error", "Unable to complete Google sign-in. Please try again.");
        return NextResponse.redirect(loginUrl);
      }

      // Handle environment-aware host routing (development vs production with load balancer)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetPath}`);
      } else {
        return NextResponse.redirect(`${origin}${targetPath}`);
      }
    } catch (err: any) {
      console.error("[OAuth Callback] Unexpected error during code exchange:", err);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "Unable to complete Google sign-in. Please try again.");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Fallback if neither code nor error was provided
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "Google sign-in could not be completed.");
  return NextResponse.redirect(loginUrl);
}
