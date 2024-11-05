// Not used any more

import { config } from "@/config/config";
import { logger } from "@/infrastructure/logger";
import {
  createRemoteJWKSet,
  type JWTPayload,
  jwtVerify,
  type JWTVerifyResult,
} from "jose";

const JWKS = createRemoteJWKSet(new URL(config.ZITADEL_JWKS_ENDPOINT ?? ""));

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function zitadelAuthMiddleware({
  authHeader,
  store,
}: { authHeader: any; store: any }) {
  if (!authHeader) {
    logger.error(`Unauthorized: Invalid Authorization header ${authHeader}`);
  }

  const token = authHeader;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: config.ZITADEL_DOMAIN,
      audience: config.ZITADEL_CLIENT_ID,
    });

    const requiredScopes = ["read:data"];
    const tokenScopes = (payload.scope as string).split(" ") || [];
    const hasRequiredScopes = requiredScopes.every((scope) =>
      tokenScopes.includes(scope),
    );

    if (!hasRequiredScopes) {
      return logger.error("Forbidden: Insufficient scope");
    }

    store.user = payload;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return logger.error(error.message);
    }
    return logger.error("Forbidden: Invalid JWT");
  }
}
