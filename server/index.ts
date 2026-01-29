import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS allowlist for embedded Hunt/Gate apps
const ALLOWED_ORIGINS = [
  "https://artemis-hub.replit.app",
  "https://artemis-hunting--arthursmt89.replit.app",
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".replit.dev")) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
  return false;
}

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Correlation-Id");
    res.setHeader("Access-Control-Expose-Headers", "X-Correlation-Id");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  
  // Handle preflight OPTIONS requests for /api/*
  if (req.method === "OPTIONS" && req.path.startsWith("/api")) {
    const referer = req.headers.referer || 'none';
    console.log(`[CORS] OPTIONS preflight`);
    console.log(`[CORS]   path: ${req.path}`);
    console.log(`[CORS]   origin: ${origin}`);
    console.log(`[CORS]   referer: ${referer}`);
    console.log(`[CORS]   allowed: ${origin ? isOriginAllowed(origin) : false}`);
    return res.status(204).end();
  }
  
  next();
});

// Replit Preview runs in iframe - allow frame-ancestors in dev
app.use((_req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    res.removeHeader("X-Frame-Options");
  }
  next();
});

app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Log de requests para /api
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (bodyJson: any) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

// Healthcheck simples
app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

(async () => {
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });

    if (process.env.NODE_ENV === "production") throw err;
    log(`ERROR ${status}: ${message}`, "error");
  });

  // Vite em dev, static em prod
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => log(`serving on port ${port}`),
  );
})();
