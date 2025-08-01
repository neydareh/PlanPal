import { createRemoteJWKSet, jwtVerify } from "jose";
import { ManagementClient } from "auth0";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.AUTH0_DOMAIN) {
  throw new Error("Environment variable AUTH0_DOMAIN not provided");
}

if (!process.env.AUTH0_CLIENT_ID) {
  throw new Error("Environment variable AUTH0_CLIENT_ID not provided");
}

if (!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error("Environment variable AUTH0_CLIENT_SECRET not provided");
}

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_CLIENT_ID,
  });
  return payload;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.user) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

async function upsertUser(userInfo: any) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, userInfo.email))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      profileImageUrl: userInfo.picture,
    });
  }
}

export function setupAuth(app: Express) {
  app.use(getSession() as any);

  app.get("/api/login", (req, res) => {
    const authUrl =
      `https://${process.env.AUTH0_DOMAIN}/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(
        `${req.protocol}://${req.get("host")}/api/callback`
      )}&` +
      `scope=openid profile email&` +
      `state=${req.sessionID}`;

    res.redirect(authUrl);
  });

  app.get("/api/callback", async (req, res) => {
    const { code, state } = req.query;

    if (state !== req.sessionID) {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    try {
      const tokenResponse = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code,
            redirect_uri: `${req.protocol}://${req.get("host")}/api/callback`,
          }),
        }
      );

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        throw new Error("No access token received");
      }

      const userResponse = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/userinfo`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );

      const userInfo = await userResponse.json();

      (req.session as any).user = {
        ...userInfo,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      };

      await upsertUser(userInfo);
      res.redirect("/");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect("/api/login");
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const sessionUser = (req.session as any).user;
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, sessionUser.email))
      .limit(1);
    res.json(dbUser);
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
}
