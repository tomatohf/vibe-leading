import {
  AgentRunner,
  finalizeRunEvents,
  type AgentRunnerConnectRequest,
  type AgentRunnerIsRunningRequest,
  type AgentRunnerRunRequest,
  type AgentRunnerStopRequest,
} from "@copilotkitnext/runtime";
import { from, Observable, ReplaySubject, switchMap } from "rxjs";
import {
  BaseEvent,
  RunAgentInput,
  EventType,
  RunStartedEvent,
  compactEvents,
} from "@ag-ui/client";
import { eq, asc } from 'drizzle-orm';
import { db } from "@/lib/db";
import { chatRuns, type ChatRun } from "@/lib/db/schema";


export class DBAgentRunner extends AgentRunner {
  private runningAgent: AgentRunnerRunRequest["agent"] | null = null;
  private stopRequested: boolean = false;

  private async storeRun(
    threadId: string,
    runId: string,
    events: BaseEvent[],
    input: RunAgentInput,
  ): Promise<void> {
    // Compact ONLY the events from this run
    const compactedEvents = compactEvents(events);

    await db.insert(chatRuns).values({
      id: runId,
      chatId: threadId,
      events: compactedEvents,
      input,
    });
  }

  private async getHistoricRuns(threadId: string): Promise<ChatRun[]> {
    /*
    const query = sql`
      WITH RECURSIVE run_chain AS (
        -- Base case: find the root runs (those without parent)
        SELECT * FROM ${chatRuns}
        WHERE chat_id = ${threadId} AND parent_run_id IS NULL
        
        UNION ALL
        
        -- Recursive case: find children of current level
        SELECT ar.* FROM ${chatRuns} ar
        INNER JOIN run_chain rc ON ar.parent_run_id = rc.run_id
        WHERE ar.chat_id = ${threadId}
      )
      SELECT * FROM run_chain
      ORDER BY created_at ASC
    `;
    const result = await db.execute(query);
    */

    return await db.query.chatRuns.findMany({
      where: eq(chatRuns.chatId, threadId),
      orderBy: asc(chatRuns.createdAt),
    });
  }


  run(request: AgentRunnerRunRequest): Observable<BaseEvent> {
    return from(this._run(request)).pipe(switchMap((obs) => obs));
  }
  private async _run(request: AgentRunnerRunRequest): Promise<Observable<BaseEvent>> {
    this.runningAgent = request.agent;

    // Get all previously seen message IDs from historic runs
    const historicRuns = await this.getHistoricRuns(request.threadId);
    const historicMessageIds = new Set<string>();
    for (const run of historicRuns) {
      for (const event of run.events) {
        if ("messageId" in event && typeof event.messageId === "string") {
          historicMessageIds.add(event.messageId);
        }
        if (event.type === EventType.RUN_STARTED) {
          const runStarted = event as RunStartedEvent;
          const messages = runStarted.input?.messages ?? [];
          for (const message of messages) {
            historicMessageIds.add(message.id);
          }
        }
      }
    }

    // Create a subject for run() return value
    const runSubject = new ReplaySubject<BaseEvent>(Infinity);
    // Accumulate events for database storage
    const currentRunEvents: BaseEvent[] = [];

    // run the agent and handle errors
    const runAgent = async () => {
      try {
        await request.agent.runAgent(request.input, {
          onEvent: ({ event }) => {
            let processedEvent: BaseEvent = event;
            if (event.type === EventType.RUN_STARTED) {
              const runStartedEvent = event as RunStartedEvent;
              if (!runStartedEvent.input) {
                const sanitizedMessages = request.input.messages
                  ? request.input.messages.filter(
                      (message) => !historicMessageIds.has(message.id),
                    )
                  : undefined;
                const updatedInput = {
                  ...request.input,
                  ...(sanitizedMessages !== undefined
                    ? { messages: sanitizedMessages }
                    : {}),
                };
                processedEvent = {
                  ...runStartedEvent,
                  input: updatedInput,
                } as RunStartedEvent;
              }
            }
            runSubject.next(processedEvent);
            currentRunEvents.push(processedEvent);
          },
        });
      } finally {
        const appendedEvents = finalizeRunEvents(currentRunEvents, {
          stopRequested: this.stopRequested,
        });
        for (const event of appendedEvents) {
          runSubject.next(event);
        }

        if (currentRunEvents.length > 0) {
          // Store the run in database
          await this.storeRun(
            request.threadId,
            request.input.runId,
            currentRunEvents,
            request.input,
          );
        }

        // Mark run as complete
        this.runningAgent = null;
        this.stopRequested = false;
        // Complete the subjects
        runSubject.complete();
      }
    };

    // Start the agent execution immediately (not lazily)
    await runAgent();

    // Return the run subject
    return runSubject.asObservable();
  }

  connect(request: AgentRunnerConnectRequest): Observable<BaseEvent> {
    return from(this._connect(request)).pipe(switchMap((obs) => obs));
  }
  private async _connect(request: AgentRunnerConnectRequest): Promise<Observable<BaseEvent>> {
    // Load historic runs from database
    const historicRuns = await this.getHistoricRuns(request.threadId);
    // Collect all historic events from database
    const allHistoricEvents: BaseEvent[] = [];
    for (const run of historicRuns) {
      allHistoricEvents.push(...run.events);
    }
    // Compact all events together before emitting
    const compactedEvents = compactEvents(allHistoricEvents);

    // Emit compacted historic events
    const connectionSubject = new ReplaySubject<BaseEvent>(Infinity);
    for (const event of compactedEvents) {
      // Ignore run error events
      if (event.type !== EventType.RUN_ERROR) {
        connectionSubject.next(event);
      }
    }
    // complete after historic events
    connectionSubject.complete();

    return connectionSubject.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isRunning(request: AgentRunnerIsRunningRequest): Promise<boolean> {
    return !!this.runningAgent;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async stop(request: AgentRunnerStopRequest): Promise<boolean | undefined> {
    if (!this.runningAgent) {
      return false;
    }

    if (this.stopRequested) {
      return false;
    }

    this.stopRequested = true;
    try {
      this.runningAgent?.abortRun();
      return true;
    } catch {
      this.stopRequested = false;
      return false;
    }
  }
}
