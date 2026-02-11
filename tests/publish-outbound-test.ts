import "dotenv/config";
import amqp from "amqplib";
import { env } from "../src/config/env";
import { EXCHANGE_NAME, ROUTING_KEYS } from "../src/config/rabbitmq";

const testMessage = {
  eventType: "OutBoundSMS",
  timestamp: new Date().toISOString(),
  correlationId: `test-${Date.now()}`,
  leadId: 987654321,
  ticketId: 7777,
  companyId: 8888,
  customerId: null,
  recipient: {
    phone: "+15714506887",
    firstName: "Test",
    lastName: "User"
  },
  message: {
    channel: "sms" as const,
    from: "+14342151980",
    text: "Test message from communication service",
    language: "en-US"
  },
  context: {
    eventType: "SmsReplyReceived",
    replyText: "Test reply",
    lead: {
      leadId: 987654321,
      title: "Test Lead",
      city: "Denver",
      state: "CO"
    }
  }
};

async function publishTest(): Promise<void> {
  const protocol = env.RABBITMQ_USE_SSL === "true" ? "amqps" : "amqp";
  const url = `${protocol}://${env.RABBITMQ_USERNAME}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}${env.RABBITMQ_VHOST}`;

  console.log("Connecting to RabbitMQ...");
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  console.log("Publishing test message...");
  const success = channel.publish(
    EXCHANGE_NAME,
    ROUTING_KEYS.SMS_OUTBOUND,
    Buffer.from(JSON.stringify(testMessage)),
    { persistent: true }
  );

  if (success) {
    console.log("✓ Message published successfully");
    console.log("  correlationId:", testMessage.correlationId);
    console.log("  from:", testMessage.message.from);
    console.log("  to:", testMessage.recipient.phone);
    console.log("  text:", testMessage.message.text);
  } else {
    console.error("✗ Failed to publish message");
  }

  await channel.close();
  await connection.close();
  console.log("Disconnected from RabbitMQ");
}

publishTest().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
