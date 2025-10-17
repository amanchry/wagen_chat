import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, context) {
  const { params } = context; // context is async
  const { id } = await params; // ✅ await here

  try {
    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;

    let res = await fetch(`${process.env.WAGEN_URL}/get-task-status/${id}`, {
      headers: { Accept: "application/json", Cookie: cookie },
    });

    if (res.status === 401 || res.status === 403) {
      // Django session expired → force frontend to log out
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error fetching task status:", err);
    return NextResponse.json(
      { error: "Failed to fetch task status" },
      { status: 500 }
    );
  }
}
