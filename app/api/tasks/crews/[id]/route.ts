import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { crews, tasks } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

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
      if (t.contexts !== undefined && !Array.isArray(t.contexts)) {
        return NextResponse.json(
          { ok: false, error: `子任务 ${i + 1} 的 contexts 必须是数组` },
          { status: 400 }
        );
      }
    }

    const existingTaskRows = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.crewId, id));
    const existingIds = new Set(existingTaskRows.map((r) => r.id));

    type TaskPayload = {
      id?: string;
      description: string;
      expectedOutput: string;
      agentId?: string;
      asyncExecution?: boolean;
      contexts?: string[];
    };
    const finalIds: string[] = [];
    const taskPayloadsWithId: { payload: TaskPayload; taskId: string }[] = [];
    for (let i = 0; i < taskList.length; i++) {
      const t = taskList[i] as TaskPayload;
      const taskId =
        t.id && existingIds.has(t.id) ? t.id : crypto.randomUUID();
      finalIds.push(taskId);
      taskPayloadsWithId.push({ payload: t, taskId });
    }
    const validIdSet = new Set(finalIds);

    for (let i = 0; i < taskPayloadsWithId.length; i++) {
      const { payload: t, taskId } = taskPayloadsWithId[i];
      const ctx = (t.contexts ?? []) as string[];
      for (const cid of ctx) {
        if (!validIdSet.has(cid)) {
          return NextResponse.json(
            {
              ok: false,
              error: `子任务 ${i + 1} 的 contexts 只能引用本团队内的其他子任务`,
            },
            { status: 400 }
          );
        }
        if (cid === taskId) {
          return NextResponse.json(
            {
              ok: false,
              error: `子任务 ${i + 1} 的 contexts 不能引用自身`,
            },
            { status: 400 }
          );
        }
      }
    }

    await db
      .update(crews)
      .set({ name: name.trim(), managerId: managerId || null })
      .where(eq(crews.id, id));

    const toDelete = existingIds.size > 0
      ? Array.from(existingIds).filter((eid) => !finalIds.includes(eid))
      : [];
    if (toDelete.length > 0) {
      await db.delete(tasks).where(inArray(tasks.id, toDelete));
    }

    for (const { payload: t, taskId } of taskPayloadsWithId) {
      const ctx = (t.contexts ?? []) as string[];
      const row = {
        id: taskId,
        crewId: id,
        description: t.description.trim(),
        expectedOutput: t.expectedOutput.trim(),
        agentId: t.agentId || null,
        asyncExecution: t.asyncExecution ?? false,
        contexts: ctx,
      };
      if (existingIds.has(taskId)) {
        await db.update(tasks).set({
          description: row.description,
          expectedOutput: row.expectedOutput,
          agentId: row.agentId,
          asyncExecution: row.asyncExecution,
          contexts: row.contexts,
        }).where(eq(tasks.id, taskId));
      } else {
        await db.insert(tasks).values(row);
      }
    }

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
