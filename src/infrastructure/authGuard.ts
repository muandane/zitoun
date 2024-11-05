// zitadelAuthPlugin.ts
// not used but let's keep it for now
import { Elysia, t } from 'elysia';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

interface AuthenticatedContext {
  user: JWTPayload & {
    scope?: string;
    email?: string;
    [key: string]: unknown;
  };
}

export const zitadelAuthPlugin = (options: {
  requiredScopes?: string[];
  zitadelDomain: string;
  audience: string;
}) => {
  const { requiredScopes = [], zitadelDomain, audience } = options;

  return (app: Elysia) => {
    app.decorate('user', null); // Decorate context with 'user' property

    app.guard(async ({ request, set }) => {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: No token provided');
      }

      const token = authHeader.substring(7);

      try {
        const JWKS_URI = `${zitadelDomain}/oauth/v2/keys`;
        const ISSUER = zitadelDomain;

        // Create a Remote JWK Set (caches keys and handles rotation)
        const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

        // Verify the JWT token
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: ISSUER,
          audience,
        });

        // Optional: Enforce required scopes
        const tokenScopes = payload.scope?.split(' ') || [];

        const hasRequiredScopes = requiredScopes.every((scope) =>
          tokenScopes.includes(scope)
        );

        if (!hasRequiredScopes) {
          throw new Error('Forbidden: Insufficient scope');
        }

        // Attach the user to the context
        set('user', payload as AuthenticatedContext['user']);
      } catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Unauthorized: Invalid token');
      }
    });
  };
};

