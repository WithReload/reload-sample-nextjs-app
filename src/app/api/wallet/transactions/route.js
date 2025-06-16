import { RELOAD_API_URL } from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = request.headers.get("authorization")?.split(" ")[1];

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${RELOAD_API_URL}/wallet/transactions?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
