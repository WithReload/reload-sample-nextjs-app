import { RELOAD_API_URL } from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  if (!body.amount) {
    return NextResponse.json(
      { error: "Amount and description are required" },
      { status: 400 }
    );
  }

  // Get the wallet token from the Authorization header
  const authHeader = request.headers.get("authorization");
  const walletToken = authHeader?.replace("Bearer ", "");

  if (!walletToken) {
    return NextResponse.json(
      { error: "Wallet token is required" },
      { status: 401 }
    );
  }

  // Get client credentials from environment variables
  const clientId =
    process.env.RELOAD_APP_ID || process.env.NEXT_PUBLIC_RELOAD_APP_ID;
  const clientSecret = process.env.RELOAD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Client credentials are not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${RELOAD_API_URL}/wallet/preview-charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${walletToken}`,
        "X-Client-ID": clientId,
        "X-Client-Secret": clientSecret,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to preview charge");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Preview charge error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
