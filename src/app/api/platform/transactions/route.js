import { RELOAD_API_URL } from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

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
    // First, get a client credentials token
    const tokenResponse = await fetch(`${RELOAD_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token request failed:", errorText);
      throw new Error("Failed to get client credentials token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access token received");
    }

    // Build query parameters for the Reload API
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);

    // Now make the platform transactions request with the Bearer token
    const response = await fetch(
      `${RELOAD_API_URL}/transactions?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      // Check if response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to fetch platform transactions"
        );
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Platform transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
