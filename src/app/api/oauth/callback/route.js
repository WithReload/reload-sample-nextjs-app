import {
  REDIRECT_URI,
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
  RELOAD_OAUTH_API_URL,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { code, codeVerifier } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const response = await fetch(`${RELOAD_OAUTH_API_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: RELOAD_APP_ID,
        client_secret: RELOAD_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to exchange code");
    }

    const tokens = await response.json();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
