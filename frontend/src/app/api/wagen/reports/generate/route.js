import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { areaId, start, end, precip, et, wri_data } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;

    let res = await fetch(`${process.env.WAGEN_URL}/getreport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookie,
      },
      body: new URLSearchParams({
  id: areaId,
        start,
        end,
        precip,
        et,
        wri_data,
      }),
    });

    // Retry once if session expired
    if (res.status === 401 || res.status === 403) {
      // Django session expired → force frontend to log out
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error calling getreport:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
