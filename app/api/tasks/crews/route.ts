import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { crews, tasks } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const crewRows = await db.select().from(crews).orderBy(crews.createdAt);
    const crewIds = crewRows.map(c => c.id);
    const taskRows = crewIds.length > 0
      ? await db
          .select()
          .from(tasks)
          .where(inArray(tasks.crewId, crewIds))
      : [];

    const tasksByCrewId = new Map<string, (typeof taskRows)[number][]>();
    for (const t of taskRows) {
      const list = tasksByCrewId.get(t.crewId) ?? [];
      list.push(t);
      tasksByCrewId.set(t.crewId, list);
    }

    const data = crewRows.map((c) => ({
      ...c,
      tasks: tasksByCrewId.get(c.id) ?? [],
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const crewId = crypto.randomUUID();

    await db.insert(crews).values({
      id: crewId,
      name: name.trim(),
      managerId: managerId || null,
    });

    const taskValues = taskList.map(
      (t: {
        description: string;
        expectedOutput: string;
        agentId?: string;
        asyncExecution?: boolean;
        contexts?: string[];
      }) => ({
        id: crypto.randomUUID(),
        crewId,
        description: t.description.trim(),
        expectedOutput: t.expectedOutput.trim(),
        agentId: t.agentId || null,
        asyncExecution: t.asyncExecution ?? false,
        contexts: t.contexts ?? [],
      })
    );

    await db.insert(tasks).values(taskValues);

    const created = await db.query.crews.findFirst({
      where: eq(crews.id, crewId),
    });

    const createdTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.crewId, crewId))
      .orderBy(tasks.createdAt);

    return NextResponse.json(
      { ok: true, data: { ...created, tasks: createdTasks } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
