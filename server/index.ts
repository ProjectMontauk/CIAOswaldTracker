import express, { type Express } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { Server } from "http";
import path from "path";

const app = express();
app.use(express.json());

// Enhanced CORS and proxy middleware with development-friendly settings
app.use((req, res, next) => {
  const replit_host = req.headers.host || '';

  // Set development-friendly headers
  if (process.env.NODE_ENV !== 'production') {
    // Always set the origin in development to match the host
    const protocol = req.secure ? 'https' : 'http';
    const origin = `${protocol}://${replit_host}`;

    // Set headers that Vite expects
    req.headers.origin = origin;
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Log headers in development for debugging
    console.log('Development request:', {
      url: req.url,
      headers: {
        host: replit_host,
        origin: origin
      }
    });
  } else {
    // Production mode - only accept Replit domains
    const origin = req.headers.origin;
    if (origin && (origin.endsWith('.replit.dev') || origin.includes('replit.co'))) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      const fallbackOrigin = `https://${replit_host}`;
      res.header('Access-Control-Allow-Origin', fallbackOrigin);
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

// Request logging middleware
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
      log(logLine);
    }
  });

  next();
});

// Initialize routes and server
(async () => {
  // Force development mode
  process.env.NODE_ENV = "development";

  const server = registerRoutes(app);
  //setupAuth(app); 

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error details:', err);
    res.status(status).json({ message });
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProduction ? 'production' : 'development'} mode`);

  if (isProduction) {
    const distPath = path.resolve(process.cwd(), "dist/public");
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    console.log('Setting up Vite development server');
    await setupVite(app, server);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(Number(PORT), "0.0.0.0", () => {
    log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
  });
})();

import { type Request, Response, NextFunction } from "express";