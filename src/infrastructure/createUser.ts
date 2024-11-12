import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import type { CreateUserRequest, ZitadelError } from "@/domain/models";
import { formatZitadelError } from "@/domain/errors";

export async function createZitadelUser(userData: CreateUserRequest) {
	const { username, email } = userData;

	logger.info("Creating new user in Zitadel", { username, email });

	const response = await fetch(`${config.ZITADEL_DOMAIN}/v2/users/human`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${config.ZITADEL_PAT}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(userData),
	});

	if (!response.ok) {
		const zitadelError = (await response.json()) as ZitadelError;
		logger.error("Failed to create user in Zitadel", zitadelError, {
			statusCode: response.status,
		});
		throw new Error(formatZitadelError(zitadelError));
	}

	const responseData = await response.json();
	logger.info("Successfully created user in Zitadel", {
		userId: responseData.userId,
	});
	return responseData;
}
