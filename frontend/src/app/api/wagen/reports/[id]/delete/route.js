import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use Django session cookie directly from NextAuth
    const cookie = session.cookie;

    let res = await fetch(`${process.env.WAGEN_URL}/deletetaskhistory/${id}`, {
      method: "DELETE", // Django may expect GET/POST — adjust if needed
      headers: { Cookie: cookie },
    });

    if (res.status === 401 || res.status === 403) {
      // Django session expired → force frontend to log out
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error deleting task:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
