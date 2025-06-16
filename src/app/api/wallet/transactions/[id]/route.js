import { RELOAD_API_URL } from "@/app/constants/general";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { id } = await context.params;
  console.log(id);
  const accessToken = request.headers.get("authorization")?.split(" ")[1];

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${RELOAD_API_URL}/wallet/transactions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transaction");
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
