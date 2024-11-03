import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { opentelemetry } from '@elysiajs/opentelemetry'
import { config } from '@/config/config';
import { handleUserCreation } from '@/services/userService';
import { logger } from '@/infrastructure/logger';

const app = new Elysia()
  .use(opentelemetry()) 
  .use(swagger())
  .post(
    '/users',
    async ({ body }) => {
      try {
        const user = await handleUserCreation(body);
        return { status: 'success', data: user };
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1, maxLength: 200 }),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        email: t.Object({
          email: t.String({ format: 'email' }),
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
            GENDER_MALE: 'GENDER_MALE',
            GENDER_FEMALE: 'GENDER_FEMALE',
            GENDER_OTHER: 'GENDER_OTHER',
          }),
        }),
      }),
      detail: {
        tags: ['Users'],
        description: 'Create a new user in Zitadel',
      },
    }
  )
  .onStart(() => {
    logger.info('Server starting', { port: config.PORT });
  })
  .listen(config.PORT);

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

logger.info('Server initialized 🦊', { host: app.server?.hostname, port: config.PORT, env: process.env.NODE_ENV || 'development' });

