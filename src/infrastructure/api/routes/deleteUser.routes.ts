import { Elysia, t } from "elysia";
import { logger } from "@/infrastructure/logger";
import { handleUserDeletion } from "@/services/userService";
import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { config } from "@/config/config";

export const deleteUser = new Elysia({ prefix: config.API_PREFIX })
	.use(bearer())
	.use(
		cors({
			origin: config.ORIGIN,
		}),
	)
	.model({
		deleteUser: t.Object({
			userId: t.String({ minLength: 1, maxLength: 200 }),
		})
	})
	.delete(
		"/users",
		async ({ bearer, body }) => {
			if (!bearer) {
				logger.info("Unauthorized: No token provided");
				return;
			}
			try {
				const user = await handleUserDeletion(body, bearer);
				return { status: "success", data: user };
			} catch (error: unknown) {
				return {
					status: "error",
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		{
			body: "deleteUser",
			detail: {
				tags: ["Users"],
				description: "Delete user in Zitadel",
			},
		},
	);
