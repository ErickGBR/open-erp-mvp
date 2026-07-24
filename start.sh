#!/bin/sh
set -e

echo "Starting Open ERP..."

# Backend: run on fixed internal port 3001 (isolated via subshell)
cd /app/backend
PORT=3001 node dist/main.js &
BACKEND_PID=$!
echo "Backend started on :3001 (PID: $BACKEND_PID)"

# Frontend: run on Render's PORT (default 3000)
cd /app/frontend
./node_modules/.bin/next start -p ${PORT:-3000} &
FRONTEND_PID=$!
echo "Frontend started on :${PORT:-3000} (PID: $FRONTEND_PID)"

# Forward SIGTERM/SIGINT to children
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# If frontend exits (main process), kill backend and exit
wait $FRONTEND_PID
echo "Frontend exited, stopping backend..."
kill $BACKEND_PID 2>/dev/null
exit 1
