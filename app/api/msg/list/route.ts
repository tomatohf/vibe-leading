import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { type ChatMessage } from "@/lib/db/schema";
import { type BaseEvent } from "@ag-ui/client";

const DEFAULT_MONTHS = 3;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const months = Math.min(
      12,
      Math.max(1, parseInt(searchParams.get("months") ?? String(DEFAULT_MONTHS), 10) || DEFAULT_MONTHS)
    );
    // 计算 N 个月前的时间点
    const now = new Date();
    const monthsAgo = new Date(
      now.getFullYear(), now.getMonth() - months, now.getDate(),
      now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds(),
    );

    type Row = {
      chat_id: string;
      tpe: string;
      robot_id: string;
      chat_messages: ChatMessage[];
      chat_created_at: Date;
      run_id: string;
      run_events: BaseEvent[];
      run_created_at: Date;
    };
    const rows = await db.execute<Row[]>(sql`
      WITH recent_runs AS (
        SELECT
          chats.id AS chat_id,
          chats.tpe AS tpe,
          chats.robot_id AS robot_id,
          chats.messages AS chat_messages,
          chats.created_at AS chat_created_at,
          chat_runs.id AS run_id,
          chat_runs.events AS run_events,
          chat_runs.created_at AS run_created_at
        FROM chat_runs
        INNER JOIN chats ON chats.id = chat_runs.chat_id
        WHERE chat_runs.created_at >= ${monthsAgo}
      ),
      latest_run_per_robot AS (
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY robot_id ORDER BY run_created_at DESC) AS rn
          FROM recent_runs
        ) ranked WHERE rn = 1
      )
      SELECT * FROM latest_run_per_robot
    `);

    const listRows: Row[] = Array.isArray(rows) && Array.isArray(rows[0]) ? (rows[0] as Row[]) : [];

    return NextResponse.json({ ok: true, data: listRows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
