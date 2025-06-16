import {
  RELOAD_API_URL,
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
  RELOAD_OAUTH_API_URL,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;

  try {
    // Get client credentials token
    const tokenResponse = await fetch(`${RELOAD_OAUTH_API_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: RELOAD_APP_ID,
        client_secret: RELOAD_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(
        error.message || "Failed to get client credentials token"
      );
    }

    const { access_token } = await tokenResponse.json();

    const res = await fetch(`${RELOAD_API_URL}/transactions?${searchParams}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch platform transactions");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
