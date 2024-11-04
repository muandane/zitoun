import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import { createRemoteJWKSet, type JWTPayload, jwtVerify, type JWTVerifyResult } from 'jose';


const JWKS = createRemoteJWKSet(new URL(config.ZITADEL_JWKS_ENDPOINT ?? ''));

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function zitadelAuthMiddleware(request:any , response:any, store:any) {
  const authHeader = request.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: config.ZITADEL_DOMAIN,
      audience: config.ZITADEL_CLIENT_ID,
    });

    const requiredScopes = ['read:data'];
    const tokenScopes = (payload.scope as string).split(' ') || [];
    const hasRequiredScopes = requiredScopes.every((scope) =>
      tokenScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      return response.status(403).json({ error: 'Forbidden: Insufficient scope' });
    }

    store.user = payload;
  } catch (error) {
    return response.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
