// userService.ts
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import type { CreateUserRequest, DeleteUserRequest } from "@/domain/models";
import { createZitadelUser } from "@/infrastructure/createUser";
import { deleteZitadelUser } from "@/infrastructure/deleteUser";

async function verifyJWT(bearer: string): Promise<JWTPayload> {
	const JWKS = createRemoteJWKSet(new URL(config.ZITADEL_JWKS_ENDPOINT ?? ""));
	const { payload } = await jwtVerify(bearer, JWKS, {
		issuer: config.ZITADEL_DOMAIN,
	});
	logger.info("Successfully verified JWT");
	if (config.DEBUG === "true") {
		logger.debug("JWT payload:", payload);
	}

	return payload;
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

		if (
			!payload["urn:zitadel:iam:org:project:roles"]?.["admin:full_access"] &&
			!payload["urn:zitadel:iam:org:project:roles"]?.["admin:manage_users"]
		) {
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
export async function handleUserDeletion(
	userData: DeleteUserRequest,
	bearer: string,
) {
	try {
		const payload = (await verifyJWT(bearer)) as {
			"urn:zitadel:iam:org:project:roles": {
				"admin:full_access": boolean;
				"admin:manage_users": boolean;
			};
		};

		if (
			!payload["urn:zitadel:iam:org:project:roles"]?.["admin:full_access"] &&
			!payload["urn:zitadel:iam:org:project:roles"]?.["admin:manage_users"]
		) {
			logger.error("Unauthorized: User does not have the 'admin' role");
			throw new Error("Unauthorized: User does not have the 'admin' role");
		}

		return await deleteZitadelUser(userData);
	} catch (error: unknown) {
		logger.error(
			`Unauthorized: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
		);
		throw error;
	}
}
