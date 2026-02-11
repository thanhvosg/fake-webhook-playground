import "dotenv/config";
import { connectRabbitMQ } from "./config/rabbitmq";
import { createNotifmeSdk } from "./config/notifme";
import { NotificationService } from "./services/notification.service";
import { TemplateService } from "./services/template.service";
import { PublisherService } from "./services/publisher.service";
import { NotificationHandler } from "./handlers/notification.handler";
import { createServer, startServer } from "./api/server";
import { logger } from "./utils/logger";

async function bootstrap(): Promise<void> {
  try {
    const { channel } = await connectRabbitMQ();

    const notifmeSdk = createNotifmeSdk();
    const notificationService = new NotificationService(notifmeSdk);
    const templateService = new TemplateService();
    const publisherService = new PublisherService(channel);

    const notificationHandler = new NotificationHandler(
      channel,
      notificationService,
      templateService
    );
    await notificationHandler.startConsuming();

    const app = createServer(publisherService);
    startServer(app);

    logger.info("Communication service started successfully");
  } catch (error) {
    logger.error("Failed to start service", { error: String(error) });
    process.exit(1);
  }
}

bootstrap();
