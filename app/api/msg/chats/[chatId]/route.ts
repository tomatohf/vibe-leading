import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { ok: false, error: "chatId 必填" },
        { status: 400 }
      );
    }

    const row = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      columns: { id: true, messages: true, tpe: true, robotId: true, createdAt: true, updatedAt: true },
    });

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "会话不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: row });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
