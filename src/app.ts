import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import { createUser } from "@/infrastructure/api/routes/createUser.routes";
import { healthService } from "@/infrastructure/api/routes/health.routes";
import { deleteUser } from "./infrastructure/api/routes/deleteUser.routes";

const app = new Elysia()
	.use(opentelemetry())
	.use(swagger())
	.onError(({ error, code }) => {
		if (code === "NOT_FOUND") return "Not Found :(";
		console.error(error);
	})
	.use(createUser)
	.use(deleteUser)
	.use(healthService)
	.onStart(() => {
		logger.info("Server starting", { port: config.PORT });
	})
	.listen(config.PORT);

logger.info("Server initialized 🦊", {
	host: app.server?.hostname,
	port: config.PORT,
	env: process.env.NODE_ENV || "development",
});
