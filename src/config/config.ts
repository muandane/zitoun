export const config = {
	ZITADEL_DOMAIN: process.env.ZITADEL_DOMAIN,
	ZITADEL_PROJECT_ID: process.env.ZITADEL_PROJECT_ID,
	ZITADEL_PAT: process.env.ZITADEL_PAT,
	ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID,
	ZITADEL_JWKS_ENDPOINT: process.env.ZITADEL_JWKS_URI,
	PORT: Number(process.env.PORT) || 3000,
};
