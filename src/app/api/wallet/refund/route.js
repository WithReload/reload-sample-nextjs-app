import {
  RELOAD_API_URL,
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
  RELOAD_OAUTH_API_URL,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

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
      throw new Error("Failed to get client credentials token");
    }

    const { access_token } = await tokenResponse.json();

    const res = await fetch(`${RELOAD_API_URL}/wallet/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
