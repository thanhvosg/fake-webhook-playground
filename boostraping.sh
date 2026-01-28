#!/usr/bin/env bash

set -e

echo "📁 Creating project structure..."

# Root folders
mkdir -p src tests

# Src structure
mkdir -p \
  src/config \
  src/handlers \
  src/services \
  src/api/middleware \
  src/types \
  src/utils

# Test structure
mkdir -p \
  tests/handlers \
  tests/services \
  tests/integration

# Files
touch \
  src/index.ts \
  src/config/env.ts \
  src/config/sqs.ts \
  src/config/notifme.ts \
  src/config/providers.ts \
  src/handlers/notification.handler.ts \
  src/handlers/webhook.handler.ts \
  src/services/notification.service.ts \
  src/services/template.service.ts \
  src/services/sqs.service.ts \
  src/api/server.ts \
  src/api/routes.ts \
  src/api/middleware/error.middleware.ts \
  src/api/middleware/signature-validator.ts \
  src/types/notification.types.ts \
  src/types/webhook.types.ts \
  src/types/index.ts \
  src/utils/logger.ts \
  src/utils/metrics.ts \
  src/utils/retry.ts \
  .env.example \
  package.json \
  tsconfig.json \
  docker-compose.yml \
  README.md

echo "✅ Project structure created successfully!"
