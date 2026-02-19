#!/usr/bin/env python
import os
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn

load_dotenv()

app = FastAPI()

def start_server():
    """Run the uvicorn server."""
    host = os.getenv('SERVER_HOST')
    port = int(os.getenv('SERVER_PORT', '8000'))
    uvicorn.run('server:app', host=host, port=port)


if __name__ == "__main__":
    start_server()
