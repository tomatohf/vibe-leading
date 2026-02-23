import { HttpAgent } from '@ag-ui/client';

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';

import { NextRequest } from 'next/server';


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
      // @ts-ignore
      default: new HttpAgent({
        url: `${process.env.HTTP_AGENT_URL_BASE}/${tpe}/${id}`,
      }),
    },
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: `/api/copilotkit/${tpe}/${id}`,
  });

  return handleRequest(req);
};
