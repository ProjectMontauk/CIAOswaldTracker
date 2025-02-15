import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Update the CORS middleware to explicitly allow the Replit host
app.use((req, res, next) => {
  const replit_host = req.headers.host || '';
  const origin = req.headers.origin;
  const allowedHost = '21b48b09-ef8c-4895-b1ad-6aedaac87b54-00-1bkgh5x0uy7ad.janeway.replit.dev';

  // Detailed logging for debugging
  console.log('Request details:', {
    host: replit_host,
    origin: origin,
    method: req.method,
    path: req.path
  });

  // Accept the specific Replit host
  if (origin && (origin.includes(allowedHost) || origin.endsWith('.replit.dev') || origin.includes('replit.co'))) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('Setting CORS for origin:', origin);
  } else {
    // Fallback to the host if no origin (e.g., direct requests)
    const fallbackOrigin = `https://${replit_host}`;
    res.header('Access-Control-Allow-Origin', fallbackOrigin);
    console.log('Setting CORS fallback:', fallbackOrigin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  process.env.NODE_ENV = "production";
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
      const indexPath = path.resolve(process.cwd(), "dist/public/index.html");
      console.log('Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    });
  } else {
    console.log('Setting up Vite development server');
    await setupVite(app, server);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
  });
})();