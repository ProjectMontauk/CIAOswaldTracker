import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced CORS middleware with development-friendly settings and logging
app.use((req, res, next) => {
  const replit_host = req.headers.host || '';
  const origin = req.headers.origin;

  // Log all headers for debugging
  console.log('Request headers:', {
    ...req.headers,
    host: replit_host,
    origin: origin,
    url: req.url
  });

  // In development mode, be more permissive with CORS
  if (process.env.NODE_ENV !== 'production') {
    // If no origin is set, use the host as origin
    if (!origin) {
      const protocol = req.secure ? 'https' : 'http';
      req.headers.origin = `${protocol}://${replit_host}`;
      console.log('Setting origin header:', req.headers.origin);
    }
    // Accept any origin in development
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  } else {
    // Production mode - only accept Replit domains
    if (origin && (origin.endsWith('.replit.dev') || origin.includes('replit.co'))) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      const fallbackOrigin = `https://${replit_host}`;
      res.header('Access-Control-Allow-Origin', fallbackOrigin);
    }
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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

(async () => {
  // Force development mode
  process.env.NODE_ENV = "development";

  const server = registerRoutes(app);
  setupAuth(app);

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