import "dotenv/config";
export const config = {
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    audience: process.env.AUTH0_AUDIENCE!,
    baseUrl: process.env.BASE_URL,
  },
  auth0Management: {
    clientId: process.env.AUTH0_M2M_CLIENT_ID!,
    clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!,
    grantType: "client_credentials",
  },
  kinde: {
    domain: process.env.KINDE_DOMAIN!,
    clientId: process.env.KINDE_CLIENT_ID!,
    clientSecret: process.env.KINDE_CLIENT_SECRET!,
    redirectUrl: process.env.KINDE_REDIRECT_URL,
    logoutUrl: process.env.KINDE_LOGOUT_URL,
    audience: process.env.KINDE_AUDIENCE,
    issuerBaseUrl:
      process.env.KINDE_ISSUER_BASE_URL ??
      (process.env.KINDE_DOMAIN
        ? `https://${process.env.KINDE_DOMAIN}`
        : undefined),
  },
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: parseInt(process.env.DB_POOL_SIZE ?? "10", 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT ?? "30000", 10),
  },
  session: {
    secret: process.env.SESSION_SECRET ?? "your-secret-key",
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    ttl: parseInt(process.env.REDIS_TTL ?? "3600", 10), // 1 hour default
  },
  apiKey: process.env.API_KEY,
  authRateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  createAccountRateLimit: {
    window: 24 * 60 * 60 * 1000, // 24 hours
    max: 100, // requests per window
  },
  defaultRateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
};
