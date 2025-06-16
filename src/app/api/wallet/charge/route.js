import { RELOAD_API_URL } from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const accessToken = request.headers.get("authorization")?.split(" ")[1];

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 401 }
    );
  }

  try {
    console.log(accessToken);
    const res = await fetch(`${RELOAD_API_URL}/wallet/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
