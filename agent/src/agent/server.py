#!/usr/bin/env python
import os
from dotenv import load_dotenv
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn

from crewai.events import (
    CrewKickoffStartedEvent,
    CrewKickoffCompletedEvent,
    CrewKickoffFailedEvent,
    AgentExecutionStartedEvent,
    AgentExecutionCompletedEvent,
    AgentExecutionErrorEvent,
)
from crewai.events import BaseEventListener

from ag_ui.core import (
    RunAgentInput,
    EventType,
    RunErrorEvent,
    RunStartedEvent,
    RunFinishedEvent,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
)
from ag_ui.encoder import EventEncoder

from agent.crew import VibeLeadingCrew


class AGUICrewAIEventListener(BaseEventListener):
    """AG-UI CrewAI event listener"""

    import weakref
    source_map = weakref.WeakKeyDictionary()

    def add(self, source, inputs):
        queue = asyncio.Queue()
        self.source_map[source] = (queue, inputs)
        return queue

    def remove(self, source):
        if source in self.source_map:
            del self.source_map[source]


    def _get(self, source):
        v = self.source_map.get(source)
        return v if v else (None, None)

    def _dispatch(self, source, event):
        (queue, _) = self._get(source)
        if queue:
            queue.put_nowait(event)

    def setup_listeners(self, crewai_event_bus):

        @crewai_event_bus.on(CrewKickoffStartedEvent)
        def _(source, event):
            (_, inputs) = self._get(source)
            thread_id = inputs and inputs.get('thread_id') or ''
            run_id = inputs and inputs.get('run_id') or ''
            self._dispatch(source, RunStartedEvent(thread_id=thread_id, run_id=run_id))

        @crewai_event_bus.on(CrewKickoffCompletedEvent)
        def _(source, event):
            (_, inputs) = self._get(source)
            thread_id = inputs and inputs.get('thread_id') or ''
            run_id = inputs and inputs.get('run_id') or ''

            self._dispatch(source, TextMessageStartEvent(message_id=run_id))
            self._dispatch(source, TextMessageContentEvent(message_id=run_id, delta=str(event.output)))
            self._dispatch(source, TextMessageEndEvent(message_id=run_id))

            self._dispatch(source, RunFinishedEvent(thread_id=thread_id, run_id=run_id))

        @crewai_event_bus.on(CrewKickoffFailedEvent)
        def _(source, event):
            self._dispatch(source, RunErrorEvent(message=event.error))

        @crewai_event_bus.on(AgentExecutionStartedEvent)
        def _(source, event):
            pass

        @crewai_event_bus.on(AgentExecutionCompletedEvent)
        def _(source, event):
            pass

        @crewai_event_bus.on(AgentExecutionErrorEvent)
        def _(source, event):
            pass


load_dotenv()
app = FastAPI()
ag_ui_crewai_event_listener = AGUICrewAIEventListener()


@app.post('/')
async def agui_endpoint(client_input: RunAgentInput, request: Request):
    """AG-UI protocol endpoint"""

    # Get the accept header from the request
    accept_header = request.headers.get("accept")
    # Create an event encoder to properly format SSE events
    agui_encoder = EventEncoder(accept=accept_header)

    inputs = {
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
        'id': client_input.thread_id,
        'thread_id': client_input.thread_id,
        'run_id': client_input.run_id,
    }

    async def event_generator():
        crew = VibeLeadingCrew().crew()
        queue = ag_ui_crewai_event_listener.add(crew, inputs)

        try:
            asyncio.create_task(crew.akickoff(inputs=inputs))

            while True:
                event = await queue.get()
                yield agui_encoder.encode(event)

                if event.type in {EventType.RUN_FINISHED, EventType.RUN_ERROR}:
                    break

        except Exception as e:
            yield agui_encoder.encode(RunErrorEvent(message=str(e)))

        finally:
            ag_ui_crewai_event_listener.remove(crew)

    return StreamingResponse(event_generator(), media_type=agui_encoder.get_content_type())


def start_server():
    """Run the uvicorn server."""
    host = os.getenv('SERVER_HOST')
    port = int(os.getenv('SERVER_PORT', '8000'))
    uvicorn.run('server:app', host=host, port=port)


if __name__ == "__main__":
    start_server()
