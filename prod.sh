#!/bin/sh

echo "Stopping any existing process on port 3600..."

PID=$(lsof -t -i:3600)

if [ -n "$PID" ]; then
    echo "Killing process on port 3600 (PID: $PID)..."
    kill -9 "$PID"
fi

echo "Starting backend on port 3600 in background..."

mkdir -p logs

nohup env PORT=3600 npx ts-node backend/src/server.ts \
    > logs/backend.log 2>&1 &

NEW_PID=$!

echo "Backend started successfully."
echo "PID: $NEW_PID"
echo "API: http://localhost:3600/api"
echo "Logs: tail -f logs/backend.log"