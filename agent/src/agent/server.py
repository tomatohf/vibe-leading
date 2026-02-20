#!/usr/bin/env python
import os
from dotenv import load_dotenv
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn

from ag_ui.core import (
    RunAgentInput,
    RunFinishedEvent,
    RunErrorEvent,
)
from ag_ui.encoder import EventEncoder

load_dotenv()

app = FastAPI()

@app.post('/')
async def agui_endpoint(client_input: RunAgentInput, request: Request):
    """AG-UI protocol endpoint"""

    # Get the accept header from the request
    accept_header = request.headers.get("accept")
    # Create an event encoder to properly format SSE events
    agui_encoder = EventEncoder(accept=accept_header)

    thread_id = client_input.thread_id
    run_id = client_input.run_id
    agent_inputs = {
        **client_input.state,
        'messages': [message.model_dump() for message in client_input.messages],
        'copilotkit': {
            'actions': [
                {
                    'type': 'function',
                    'function': tool.model_dump(),
                }
                for tool in client_input.tools
            ]
        },
        'id': thread_id,
    }

    async def event_generator():
        try:
            # FIXME: TBD
            yield agui_encoder.encode(RunFinishedEvent(thread_id=thread_id, run_id=run_id))

        except Exception as e:
            yield agui_encoder.encode(RunErrorEvent(message=str(e)))

    return StreamingResponse(event_generator(), media_type=agui_encoder.get_content_type())


def start_server():
    """Run the uvicorn server."""
    host = os.getenv('SERVER_HOST')
    port = int(os.getenv('SERVER_PORT', '8000'))
    uvicorn.run('server:app', host=host, port=port)


if __name__ == "__main__":
    start_server()
