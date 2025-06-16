import {
  RELOAD_API_URL,
  RELOAD_APP_ID,
  RELOAD_CLIENT_SECRET,
} from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const walletToken = request.headers.get("authorization")?.split(" ")[1];

  if (!walletToken) {
    return NextResponse.json(
      { error: "Wallet token is required" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${RELOAD_API_URL}/wallet/transactions?${searchParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${walletToken}`,
          "x-client-id": RELOAD_APP_ID,
          "x-client-secret": RELOAD_CLIENT_SECRET,
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch transactions");
    }

    const data = await res.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
