import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

registerRoutes(app);

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
