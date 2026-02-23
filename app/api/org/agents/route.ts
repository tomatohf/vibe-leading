import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(agents).orderBy(agents.createdAt);
    return NextResponse.json({ ok: true, data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, goal, backstory } = body ?? {};

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { ok: false, error: "角色（role）必填" },
        { status: 400 }
      );
    }

    if (!goal || typeof goal !== "string") {
      return NextResponse.json(
        { ok: false, error: "目标（goal）必填" },
        { status: 400 }
      );
    }

    if (!backstory || typeof backstory !== "string") {
      return NextResponse.json(
        { ok: false, error: "背景（backstory）必填" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.insert(agents).values({ id, role, goal, backstory });

    const created = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });

    if (!created) {
      return NextResponse.json(
        { ok: false, error: "插入 Agent 失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
