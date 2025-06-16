import {
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
  RELOAD_OAUTH_API_URL,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${RELOAD_OAUTH_API_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token,
        client_id: RELOAD_APP_ID,
        client_secret: RELOAD_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to refresh token");
    }

    const tokens = await response.json();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
