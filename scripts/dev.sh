#!/bin/bash

# A simple script to start both environments (primarily for Unix-like systems)
# Note: On Windows, use `npm run dev` from the root directory instead.

echo "Starting backend..."
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Trap SIGINT to kill both processes when exiting
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT

wait
