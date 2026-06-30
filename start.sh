#!/bin/bash

echo "Stopping any existing processes on ports 8080, 5173, and 3002..."

# Kill process on port 3002 (Backend)
BE_PID=$(lsof -t -i:3002)
if [ ! -z "$BE_PID" ]; then
  echo "Killing process on port 3002 (PID: $BE_PID)..."
  kill -9 $BE_PID
fi

# Kill process on port 8080 (Frontend)
FE_PID=$(lsof -t -i:8080)
if [ ! -z "$FE_PID" ]; then
  echo "Killing process on port 8080 (PID: $FE_PID)..."
  kill -9 $FE_PID
fi

# Kill lingering vite processes on default port 5173
VITE_PID=$(lsof -t -i:5173)
if [ ! -z "$VITE_PID" ]; then
  echo "Killing process on port 5173 (PID: $VITE_PID)..."
  kill -9 $VITE_PID
fi

echo "=================================================="
echo "Starting both Frontend and Backend together..."
echo "Backend: http://localhost:3002/api"
echo "Frontend: http://localhost:8080/"
echo "Press Ctrl+C to stop both servers."
echo "=================================================="

# Use concurrently to run both in the same terminal with clean log prefixes
npx concurrently -c "blue,green" -n "BE,FE" \
  "cd backend && npm run dev" \
  "npm run dev"

