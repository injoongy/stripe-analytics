#!/bin/sh

# Check if REDIS_URL is set
if [ -z "$REDIS_URL" ]; then
  echo "⚠️  REDIS_URL not set. Waiting for configuration..."
  echo "The worker will remain idle until REDIS_URL is configured."
  # Sleep indefinitely - allows the container to deploy without crashing
  sleep infinity
else
  echo "✅ REDIS_URL is set. Starting worker..."
  exec bun run start
fi
