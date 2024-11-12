import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import type { DeleteUserRequest, ZitadelError } from "@/domain/models";
import { formatZitadelError } from "@/domain/errors";

export async function deleteZitadelUser(userData: DeleteUserRequest) {
	const userId = userData.userId;

  logger.info("Deleting user in Zitadel", { userId });

  const url = `${config.ZITADEL_DOMAIN}/v2/users/${userId}`;

	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${config.ZITADEL_PAT}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const zitadelError = await response.json() as ZitadelError;
		logger.error("Failed to delete user in Zitadel", zitadelError, {
			statusCode: response.status,
		});
		throw new Error(formatZitadelError(zitadelError));
	}

	logger.info("Successfully deleted user in Zitadel", { userId });
	return { message: "User deleted successfully" };
}
