import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { name, geom } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;

    let res = await fetch(`${process.env.WAGEN_URL}/addFeature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookie,
      },
      body: new URLSearchParams({
        name,
        geom: typeof geom === "string" ? geom : JSON.stringify(geom),
      }),
    });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }


    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Failed to add feature" }, { status: 500 });
  }
}
