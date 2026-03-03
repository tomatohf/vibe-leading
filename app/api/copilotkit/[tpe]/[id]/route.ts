import { HttpAgent } from '@ag-ui/client';

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';

import { NextRequest } from 'next/server';
import { DBAgentRunner } from './db-agent-runner';


type RouteParams = {
  params: Promise<{
    tpe: string;
    id: string;
  }>;
};

const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest, { params }: RouteParams) => {
  const { tpe, id } = await params;
  const runtime = new CopilotRuntime({
    agents: {
      // @ts-expect-error(ignore)
      default: new HttpAgent({
        url: `${process.env.HTTP_AGENT_URL_BASE}/${tpe}/${id}`,
      }),
    },
    runner: new DBAgentRunner(),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: `/api/copilotkit/${tpe}/${id}`,
  });

  return handleRequest(req);
};
