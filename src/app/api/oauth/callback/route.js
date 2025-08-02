import {
  REDIRECT_URI,
  RELOAD_API_URL,
  RELOAD_APP_ID,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code, codeVerifier } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (!codeVerifier) {
      return NextResponse.json(
        { error: "No code verifier provided" },
        { status: 400 }
      );
    }

    if (!RELOAD_APP_ID) {
      return NextResponse.json(
        { error: "RELOAD_APP_ID not configured" },
        { status: 500 }
      );
    }

    if (!process.env.RELOAD_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "RELOAD_CLIENT_SECRET not configured" },
        { status: 500 }
      );
    }

    const tokenRequestBody = {
      grant_type: "authorization_code",
      code,
      client_id: RELOAD_APP_ID,
      client_secret: process.env.RELOAD_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    };

    const response = await fetch(`${RELOAD_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorMessage = "Failed to exchange code";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${errorText.substring(
          0,
          100
        )}`;
      }

      throw new Error(errorMessage);
    }

    const tokens = await response.json();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("API Route - Token exchange error:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
