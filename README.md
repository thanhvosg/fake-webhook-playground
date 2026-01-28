# Communication Service

A service for handling notifications (Email/SMS) via SQS queues and processing Telnyx webhook replies.


## Architecture

SQS (Incoming) → Handler → Template Service → NotifMe SDK → Email/SMS Providers
Telnyx Webhook → Validation → Handler → SQS (Replies)

## Architect

# Architecture

## Core Requirements
- Consume messages from SQS
- Send notifications via NotifMe SDK (email/SMS)
- Receive Telnyx webhook replies
- Publish replies back to SQS

## Folder Structure

```
.
├── src/
│   ├── index.ts                          # App entry & bootstrap
│   │
│   ├── config/
│   │   ├── env.ts                        # Environment variables
│   │   ├── sqs.ts                        # SQS configuration
│   │   ├── notifme.ts                    # NotifMe SDK setup
│   │   └── providers.ts                  # Email/SMS provider configs
│   │
│   ├── handlers/
│   │   ├── notification.handler.ts       # Process SQS messages → send notifications
│   │   └── webhook.handler.ts            # Process Telnyx webhooks → SQS
│   │
│   ├── services/
│   │   ├── notification.service.ts       # Send via NotifMe (email/SMS)
│   │   ├── template.service.ts           # Render templates (handlebars/mustache)
│   │   └── sqs.service.ts                # Publish to SQS queues
│   │
│   ├── api/
│   │   ├── server.ts                     # Express setup
│   │   ├── routes.ts                     # Webhook routes
│   │   └── middleware/
│   │       ├── error.middleware.ts
│   │       └── signature-validator.ts    # Verify Telnyx webhooks
│   │
│   ├── types/
│   │   ├── notification.types.ts         # Message contracts
│   │   ├── webhook.types.ts              # Telnyx webhook types
│   │   └── index.ts
│   │
│   └── utils/
│       ├── logger.ts                     # Winston/Pino
│       ├── metrics.ts                    # Optional: Prometheus metrics
│       └── retry.ts                      # Retry logic for failed sends
│
├── tests/
│   ├── handlers/
│   ├── services/
│   └── integration/
│
├── .env.example
├── package.json
├── tsconfig.json
├── docker-compose.yml                    # Local SQS for dev
└── README.md
```

## Message Flow

### Outbound (Send Notification)
```
SQS Queue (incoming) 
  → notification.handler.ts 
  → template.service.ts (render)
  → notification.service.ts (NotifMe SDK)
  → Email/SMS Provider
```

### Inbound (Reply Processing)
```
Telnyx Webhook 
  → webhook.handler.ts (validate signature)
  → sqs.service.ts
  → SQS Queue (replies)
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd communication-service

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-access-key

# SQS Queues
SQS_INCOMING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/notifications-incoming
SQS_REPLIES_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/notifications-replies

# Email Provider (e.g., SendGrid, Mailgun, SES)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@example.com

# SMS Provider (Telnyx)
SMS_PROVIDER=telnyx
TELNYX_API_KEY=your-telnyx-api-key
TELNYX_MESSAGING_PROFILE_ID=your-messaging-profile-id
TELNYX_PUBLIC_KEY=your-telnyx-public-key

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret
```

## Local Development

### Start LocalStack (Local AWS Services)

```bash
# Start LocalStack with SQS
docker compose up -d

# Check LocalStack is running
curl http://localhost:4566/_localstack/health
```

### Run Development Server

```bash
# Run with hot reload
npm run dev
```

The server will start on `http://localhost:3000`
