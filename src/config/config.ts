export const config = {
	ZITADEL_DOMAIN: process.env.ZITADEL_DOMAIN,
	ZITADEL_JWKS_ENDPOINT: process.env.ZITADEL_JWKS_URI,
	ZITADEL_PAT: process.env.ZITADEL_PAT,
	DEBUG: process.env.DEBUG,
	PORT: Number(process.env.PORT) || 3000,
};
