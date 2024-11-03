export const config = {
  ZITADEL_DOMAIN: process.env.ZITADEL_DOMAIN || 'https://your-instance.zitadel.cloud',
  ZITADEL_PAT: process.env.ZITADEL_PAT || 'your-personal-access-token',
  PORT: Number(process.env.PORT) || 3000,
};
