#!/bin/bash

# Start Production Server Script for Render/Cloud Deployment

echo "🚀 Starting Agent Mira Backend Server (Production Mode)..."
echo ""

# Use PORT environment variable from Render, default to 8000
PORT="${PORT:-8000}"

echo "✅ Starting server on 0.0.0.0:$PORT"
echo "📚 API Docs will be available at /docs"
echo ""

# Start the server (production mode)
# --host 0.0.0.0 binds to all network interfaces (required for Render)
# --port uses the PORT environment variable from Render
uvicorn main:app --host 0.0.0.0 --port $PORT
