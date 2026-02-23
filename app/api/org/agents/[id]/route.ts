import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const row = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Agent 不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: row });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    await db.update(agents).set({ role, goal, backstory }).where(eq(agents.id, id));

    const updated = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Agent 不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Agent 不存在" },
        { status: 404 }
      );
    }

    await db.delete(agents).where(eq(agents.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

