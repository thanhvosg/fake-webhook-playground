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
