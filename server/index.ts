import "dotenv/config";
import express from "express";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { serveStatic, setupVite } from "./vite";
import { createServer } from "http";
import { correlationMiddleware } from "./src/middleware/correlation.middleware";
import { errorHandler } from "./src/middleware/error.middleware";
import LoggerService from "./src/utils/logger";
import { swaggerSpec } from "./src/config/swagger";
import { registerRoutes } from "./src/routes";
import { config } from "@server/config";

const app = express();

// Add compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// login route
app.get("/login", async (_, res) => {
  console.log("login");
  const url = "https://dev-xnai8ncc3612wn4n.us.auth0.com/authorize";
  const payload = {
    response_type: "code",
    client_id: config.auth0.clientId,
    redirect_uri: `${config.auth0.baseUrl}/`,
    scope: "openid email",
    audience: config.auth0.audience,
  };
  // redirect to url and payload
  const params = new URLSearchParams(payload as Record<string, string>);
  const redirectUrl = `${url}?${params.toString()}`;
  res.redirect(redirectUrl);
});


app.get("/logout", async (_, res) => {
  res.redirect(
    `https://${config.auth0.domain}/v2/logout?client_id=${
      config.auth0.clientId
    }&returnTo=${encodeURIComponent(
      config.auth0.baseUrl || "http://localhost:5002"
    )}`
  );
});

// Register all routes (including auth routes)
registerRoutes(app);

// Swagger API Documentation
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve);
  app.get(
    "/api-docs",
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "PlanPal API Documentation",
    })
  );

  // Endpoint to get the Swagger spec as JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// Add correlation IDs to all requests
app.use(correlationMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      LoggerService.info(
        `${req.method} ${path} ${res.statusCode} completed in ${duration}ms`,
        LoggerService.getRequestContext(req)
      );
    }
  });

  next();
});

// Error handling middleware should be last
app.use(errorHandler);

const server = createServer(app);

if (app.get("env") === "development") {
  setupVite(app, server).then(() => {
    const port = parseInt(process.env.PORT || "5002", 10);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  });
} else {
  serveStatic(app);
  const port = parseInt(process.env.PORT || "5002", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}
