import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/db — 检查数据库连接是否正常（可作 health check）
 */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 503 }
    );
  }
}
