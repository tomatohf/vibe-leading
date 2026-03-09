import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { crews, tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const crew = await db.query.crews.findFirst({
      where: eq(crews.id, id),
    });

    if (!crew) {
      return NextResponse.json(
        { ok: false, error: "团队任务不存在" },
        { status: 404 }
      );
    }

    const taskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.crewId, id))
      .orderBy(tasks.createdAt);

    return NextResponse.json({ ok: true, data: { ...crew, tasks: taskRows } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.query.crews.findFirst({
      where: eq(crews.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "团队任务不存在" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, managerId, tasks: taskList } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "团队任务名称（name）必填" },
        { status: 400 }
      );
    }

    if (!Array.isArray(taskList) || taskList.length === 0) {
      return NextResponse.json(
        { ok: false, error: "至少需要一个子任务" },
        { status: 400 }
      );
    }

    for (let i = 0; i < taskList.length; i++) {
      const t = taskList[i];
      if (!t.description || typeof t.description !== "string") {
        return NextResponse.json(
          { ok: false, error: `子任务 ${i + 1} 的描述（description）必填` },
          { status: 400 }
        );
      }
      if (!t.expectedOutput || typeof t.expectedOutput !== "string") {
        return NextResponse.json(
          {
            ok: false,
            error: `子任务 ${i + 1} 的期望输出（expectedOutput）必填`,
          },
          { status: 400 }
        );
      }
    }

    await db
      .update(crews)
      .set({ name: name.trim(), managerId: managerId || null })
      .where(eq(crews.id, id));

    // Delete old tasks, then re-insert
    await db.delete(tasks).where(eq(tasks.crewId, id));

    const taskValues = taskList.map(
      (t: {
        description: string;
        expectedOutput: string;
        agentId?: string;
        asyncExecution?: boolean;
        contexts?: string[];
      }) => ({
        id: crypto.randomUUID(),
        crewId: id,
        description: t.description.trim(),
        expectedOutput: t.expectedOutput.trim(),
        agentId: t.agentId || null,
        asyncExecution: t.asyncExecution ?? false,
        contexts: t.contexts ?? [],
      })
    );

    await db.insert(tasks).values(taskValues);

    const updated = await db.query.crews.findFirst({
      where: eq(crews.id, id),
    });

    const updatedTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.crewId, id))
      .orderBy(tasks.createdAt);

    return NextResponse.json({
      ok: true,
      data: { ...updated, tasks: updatedTasks },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
