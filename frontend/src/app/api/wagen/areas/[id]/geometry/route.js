import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;


    const res = await fetch(`${process.env.WAGEN_URL}/getarea-geometry/${id}`, {
      headers: {
        Accept: "application/json",
        Cookie: cookie,
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Django API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching geometry:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
