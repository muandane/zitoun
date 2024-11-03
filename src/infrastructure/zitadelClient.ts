import { config } from '@/config/config';
import { logger } from '@/infrastructure/logger';
import type { CreateUserRequest, ZitadelError } from '@/domain/models';
import { formatZitadelError } from '@/domain/errors';

export async function createZitadelUser(userData: CreateUserRequest) {
  logger.info('Creating new user in Zitadel', { username: userData.username, email: userData.email.email });

  try {
    const response = await fetch(`${config.ZITADEL_DOMAIN}/v2/users/human`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.ZITADEL_PAT}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const zitadelError = responseData as ZitadelError;
      logger.error('Failed to create user in Zitadel', zitadelError, { statusCode: response.status });
      throw new Error(formatZitadelError(zitadelError));
    }

    logger.info('Successfully created user in Zitadel', { userId: responseData.id });
    return responseData;
  } catch (error) {
    logger.error('Error creating user', error, { username: userData.username });
    throw error;
  }
}
