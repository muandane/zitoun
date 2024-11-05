// userService.ts
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import type { CreateUserRequest, ZitadelError } from "@/domain/models";
import { formatZitadelError } from "@/domain/errors";

async function verifyJWT(bearer: string): Promise<JWTPayload> {
	const JWKS = createRemoteJWKSet(new URL(config.ZITADEL_JWKS_ENDPOINT ?? ""));
	const { payload, protectedHeader } = await jwtVerify(bearer, JWKS, {
		issuer: config.ZITADEL_DOMAIN,
	});
	if (config.DEBUG === "true") {
		logger.debug("JWT payload:", payload);
		logger.debug("JWT protected header:", protectedHeader);
	}

	return payload;
}

async function createZitadelUser(userData: CreateUserRequest) {
	logger.info("Creating new user in Zitadel", {
		username: userData.username,
		email: userData.email.email,
	});

	try {
		const response = await fetch(`${config.ZITADEL_DOMAIN}/v2/users/human`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.ZITADEL_PAT}`,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
		const responseData = await response.json();

		if (!response.ok) {
			const zitadelError = responseData as ZitadelError;
			logger.error("Failed to create user in Zitadel", zitadelError, {
				statusCode: response.status,
			});
			throw new Error(formatZitadelError(zitadelError));
		}

		logger.info("Successfully created user in Zitadel", {
			userId: responseData.userId,
		});
		return responseData;
	} catch (error) {
		logger.error("Error creating user", error, { username: userData.username });
		throw error;
	}
}

export async function handleUserCreation(
	userData: CreateUserRequest,
	bearer: string,
) {
	try {
		const payload = (await verifyJWT(bearer)) as {
			"urn:zitadel:iam:org:project:roles": {
				"admin:full_access": boolean;
				"admin:manage_users": boolean;
			};
		};

		// Check if the user has the "admin" role
		const hasAdminRole =
			payload["urn:zitadel:iam:org:project:roles"]?.["admin:full_access"] ||
			payload["urn:zitadel:iam:org:project:roles"]?.["admin:manage_users"];

		if (hasAdminRole) {
			logger.info("User has the 'admin' role, allowing user creation");
		} else {
			logger.error("Unauthorized: User does not have the 'admin' role");
			throw new Error("Unauthorized: User does not have the 'admin' role");
		}

		return await createZitadelUser(userData);
	} catch (error: unknown) {
		logger.error(
			`Unauthorized: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
		);
		throw error;
	}
}
