import { NextResponse } from "next/server";
import { refreshSession } from "../../../lib/auth";

export async function POST() {
  const ok = await refreshSession();
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
