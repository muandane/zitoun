import { Elysia, t } from "elysia";
import { logger } from "@/infrastructure/logger";
import { handleUserCreation } from "@/services/userService";
import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { config } from "@/config/config";

export const createUser = new Elysia({ prefix: config.API_PREFIX })
	.use(bearer())
	.use(
		cors({
			origin: config.ORIGIN,
		}),
	)
	.model({
		createUser: t.Object({
			username: t.String({ minLength: 1, maxLength: 200 }),
			firstName: t.Optional(t.String()),
			lastName: t.Optional(t.String()),
			email: t.Object({
				email: t.String({ format: "email" }),
				isVerified: t.Boolean(),
			}),
			password: t.Object({
				password: t.String({ minLength: 8 }),
				changeRequired: t.Boolean(),
			}),
			profile: t.Object({
				givenName: t.String(),
				familyName: t.String(),
				nickName: t.Optional(t.String()),
				displayName: t.String(),
				preferredLanguage: t.String(),
				gender: t.Enum({
					GENDER_MALE: "GENDER_MALE",
					GENDER_FEMALE: "GENDER_FEMALE",
					GENDER_OTHER: "GENDER_OTHER",
				}),
			}),
		}),
	})
	.post(
		"/users",
		async ({ bearer, body }) => {
			if (!bearer) {
				logger.info("Unauthorized: No token provided");
				return;
			}
			try {
				const user = await handleUserCreation(body, bearer);
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
			body: "createUser",
			detail: {
				tags: ["Users"],
				description: "Create a new user in Zitadel",
			},
		},
	);
