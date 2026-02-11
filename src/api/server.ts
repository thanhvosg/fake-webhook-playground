import express, { Application } from "express";
import { createRoutes } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { PublisherService } from "../services/publisher.service";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export function createServer(publisherService: PublisherService): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(createRoutes(publisherService));
  app.use(errorMiddleware);

  return app;
}

export function startServer(app: Application): void {
  const port = parseInt(env.PORT, 10);

  app.listen(port, () => {
    logger.info("Server started", { port, env: env.NODE_ENV });
  });
}
