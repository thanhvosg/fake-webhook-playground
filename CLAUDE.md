# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Communication Service is a TypeScript/Node.js service for handling notifications (Email/SMS) via RabbitMQ queues and processing Telnyx webhook replies. The service acts as a bridge between RabbitMQ message queues and notification providers (email/SMS), while also receiving and processing inbound SMS replies via Telnyx webhooks.

**Language**: TypeScript (Node.js)
**Package Manager**: npm
**Module System**: CommonJS

## Architecture

### Message Flow

**Outbound Notifications (RabbitMQ → Providers)**:
```
RabbitMQ Queue (sms_outbound.queue)
  → notification.handler.ts
  → template.service.ts (render templates)
  → notification.service.ts (NotifMe SDK)
  → Email/SMS Provider (SendGrid, Telnyx, etc.)
```

**Inbound Replies (Telnyx Webhook → RabbitMQ)**:
```
Telnyx Webhook (POST)
  → webhook.handler.ts (validate signature)
  → sqs.service.ts
  → RabbitMQ Queue (sms_inbound.queue)
```

### Core Components

**Handlers** (`src/handlers/`)
- `notification.handler.ts`: Processes RabbitMQ messages and sends notifications
- `webhook.handler.ts`: Processes Telnyx webhook events for SMS replies

**Services** (`src/services/`)
- `notification.service.ts`: Sends notifications via NotifMe SDK
- `template.service.ts`: Renders message templates (Handlebars/Mustache)
- `sqs.service.ts`: Publishes messages to RabbitMQ queues

**API** (`src/api/`)
- `server.ts`: Express server setup
- `routes.ts`: Webhook endpoint routes
- `middleware/signature-validator.ts`: Verifies Telnyx webhook signatures
- `middleware/error.middleware.ts`: Global error handling

**Configuration** (`src/config/`)
- `env.ts`: Environment variable configuration
- `sqs.ts`: RabbitMQ client configuration
- `notifme.ts`: NotifMe SDK setup with provider configs
- `providers.ts`: Email/SMS provider configurations

### Key Dependencies

- **NotifMe SDK**: Multi-provider notification library supporting email/SMS
- **sqs-consumer**: Message consumer library
- **Zod**: TypeScript-first schema validation

## TypeScript Configuration

The project uses strict TypeScript settings:
- **Target**: ES2021
- **Module**: CommonJS
- **Strict mode**: Enabled (includes `noImplicitAny`, `strictNullChecks`)
- **Source maps**: Enabled for debugging

## Testing Structure

```
tests/
├── handlers/          # Handler unit tests
├── services/          # Service unit tests
└── integration/       # Integration tests
```

Use `npm run test:integration` to run only integration tests that verify end-to-end flows.

## Environment Variables

Required environment variables (see `.env.example` for complete list):

**Core Configuration**:
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (info/debug/error)

**Email Provider (SendGrid/Mailgun/SES)**:
- `EMAIL_PROVIDER`: Provider name
- `SENDGRID_API_KEY`: SendGrid API key (if using SendGrid)
- `EMAIL_FROM`: Default sender email

**SMS Provider (Telnyx)**:
- `SMS_PROVIDER`: Provider name (telnyx)
- `TELNYX_API_KEY`: Telnyx API key
- `TELNYX_MESSAGING_PROFILE_ID`: Messaging profile ID
- `TELNYX_PUBLIC_KEY`: Public key for webhook signature verification

**Webhook Configuration**:
- `WEBHOOK_SECRET`: Secret for webhook validation

## Message Contracts (`message/`)

- `lead-received.json`: LeadCreated event message published with routing key `lead_receive`.
- `inbound-message.json`: Inbound SMS reply event published with routing key `sms_inbound_message`.
- `outbound-message.json`: AI-generated SMS event published with routing key `sms_outbound_message`.

## Queue Flow

### FLOW

Producer sends a message to `messages.exchange`.

Producer must include a routing key indicating the message type.

RabbitMQ uses the routing key to place the message into the matching queue.

Consumer reads from that queue.

### WHAT PRODUCER SENDS

Producer always sends to:

exchange: `messages.exchange`

Producer sets one of these routing keys:

`lead_receive`  
`sms_inbound_message`  
`sms_outbound_message`

Producer sends any JSON/body as the message.

### HOW ROUTING WORKS

If producer sends:

routing key = `lead_receive`

Message goes to:

`lead_receive.queue`

If producer sends:

routing key = `sms_inbound_message`

Message goes to:

`sms_inbound.queue`

If producer sends:

routing key = `sms_outbound_message`

Message goes to:

`sms_outbound.queue`

## Webhook Security

Telnyx webhooks include signatures for verification. The `signature-validator.ts` middleware verifies webhook authenticity using `TELNYX_PUBLIC_KEY` before processing.

## Integration with Tradesly Ecosystem

This service is part of the Tradesly monorepo and integrates with:
- **CRM Backend**: Publishes notification requests to RabbitMQ
- **Call Service**: May consume reply messages from RabbitMQ for call-related communications

When deployed, ensure RabbitMQ queues are properly configured and accessible by both this service and the CRM backend.
