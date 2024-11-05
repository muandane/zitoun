import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { config } from "@/config/config";
import { handleUserCreation } from "@/services/userService";
import { logger } from "@/infrastructure/logger";
import jwt from "@elysiajs/jwt";
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

const app = new Elysia()
	.derive(({ headers }) => {
		const auth = headers.authorization;
		return {
			bearer: auth?.startsWith("Bearer ") ? auth.slice(7) : null,
		};
	})
	.onError(({ error, code }) => {
		if (code === "NOT_FOUND") return "Not Found :(";
		console.error(error);
	})
	.use(opentelemetry())
	.use(swagger())
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
	.use(
		jwt({
      naem: 'jwt',
			secret: "xxx",
			async verify(token: string) {
				const JWKS = createRemoteJWKSet(
					new URL(config.ZITADEL_JWKS_ENDPOINT ?? ""),
				);
				logger.info(config.ZITADEL_JWKS_ENDPOINT as string)

				try {
					const { payload } = await jwtVerify(token, JWKS, {
						issuer: config.ZITADEL_DOMAIN,
						audience: `urn:zitadel:iam:org:project:id:${config.ZITADEL_PROJECT_ID}:aud`,
					});
					return payload as JWTPayload;
				} catch (error: unknown) {
					if (error instanceof Error) {
						logger.error(error.message);
					} else {
						logger.error("Unknown error occurred");
					}
					return undefined;
				}
			},
		}),
	)
	.post(
		"/users",
		async ({ jwt, bearer, body }) => {
      const checkJWT = await jwt.verify(bearer as string);
			logger.info("JWT is ", { checkJWT });
			if (!checkJWT) {
				return logger.error(`JWT is not valid ${bearer}`);
			}
			try {
				const user = await handleUserCreation(body);
				return { status: "success", data: user };
			} catch (error) {
				return {
					status: "error",
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		{
			body: "createUser",
			zitadelAuth: true,
			detail: {
				tags: ["Users"],

				description: "Create a new user in Zitadel",
			},
		},
	)
	.onStart(() => {
		logger.info("Server starting", { port: config.PORT });
	})
	.listen(config.PORT);

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
logger.info("Server initialized 🦊", {
	host: app.server?.hostname,
	port: config.PORT,
	env: process.env.NODE_ENV || "development",
});
