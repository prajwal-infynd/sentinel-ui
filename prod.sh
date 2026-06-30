#!/bin/bash

echo "Stopping any existing process on port 3600 (Backend)..."

BE_PID=$(lsof -t -i:3600)
if [ -n "$BE_PID" ]; then
    echo "Killing Backend on port 3600 (PID: $BE_PID)..."
    kill -9 "$BE_PID"
fi

mkdir -p logs

echo "Starting backend on port 3600 in background..."
nohup env NODE_OPTIONS='--dns-result-order=ipv4first' PORT=3600 npx ts-node backend/src/server.ts \
    > logs/backend.log 2>&1 &
NEW_BE_PID=$!

echo "=================================================="
echo "Backend started successfully in background!"
echo "It will keep running even if this terminal is closed."
echo "Backend PID: $NEW_BE_PID | API: http://localhost:3600/api"
echo "To view logs: tail -f logs/backend.log"
echo "=================================================="