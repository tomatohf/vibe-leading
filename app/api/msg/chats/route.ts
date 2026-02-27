import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, chatTpeEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tpe, robotId, messages } = body ?? {};

    if (
      !tpe ||
      typeof tpe !== "string" ||
      !chatTpeEnum.includes(tpe as (typeof chatTpeEnum)[number])
    ) {
      return NextResponse.json(
        { ok: false, error: "tpe 必填且须为 agent 或 crew" },
        { status: 400 }
      );
    }

    if (!robotId || typeof robotId !== "string") {
      return NextResponse.json(
        { ok: false, error: "robotId 必填" },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { ok: false, error: "messages 须为数组" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.insert(chats).values({
      id,
      tpe: tpe as (typeof chatTpeEnum)[number],
      robotId,
      messages,
    });

    const created = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });

    if (!created) {
      return NextResponse.json(
        { ok: false, error: "插入 Chat 失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
