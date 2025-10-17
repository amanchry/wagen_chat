// app/api/wagen/reports/list/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;

    const res = await fetch(`${process.env.WAGEN_URL}/getAddedAreasList`, {
      headers: { Accept: "application/json", Cookie: cookie },
    });

    if (res.status === 401 || res.status === 403) {
      // Django session expired → force frontend to log out
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // ✅ Parse JSON normally
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      // ✅ Fallback: log HTML/text once
      const text = await res.text();
      console.error("Django did not return JSON:", res.status, text.slice(0, 200));
      return NextResponse.json(
        { error: "Unexpected response from Django", status: res.status },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Error fetching reports list:", err);
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
  }
}
