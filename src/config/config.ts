export const config = {
	ZITADEL_DOMAIN: process.env.ZITADEL_DOMAIN,
	ZITADEL_JWKS_ENDPOINT: process.env.ZITADEL_JWKS_URI,
	ZITADEL_PAT: process.env.ZITADEL_PAT,
	ORIGIN: process.env.CORS_ALLOWED_ORIGIN,
	DEBUG: process.env.DEBUG,
	API_PREFIX: process.env.API_PREFIX || "/v1",
	PORT: Number(process.env.PORT) || 3000,
};
