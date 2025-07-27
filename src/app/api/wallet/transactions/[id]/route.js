import {
  RELOAD_API_URL,
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { id } = await context.params;
  const walletToken = request.headers.get("authorization")?.split(" ")[1];

  if (!walletToken) {
    return NextResponse.json(
      { error: "Wallet token is required" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${RELOAD_API_URL}/wallet/transactions/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${walletToken}`,
          "x-client-id": RELOAD_APP_ID,
          "x-client-secret": RELOAD_CLIENT_SECRET,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || "Failed to fetch transaction");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
