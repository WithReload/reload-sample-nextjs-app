import { RELOAD_API_URL, RELOAD_APP_ID } from "@/app/constants/general";
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
    const response = await fetch(`${RELOAD_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token,
        client_id: RELOAD_APP_ID,
        client_secret: process.env.RELOAD_CLIENT_SECRET,
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
