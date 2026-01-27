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

/**
 * ✅ Replit Preview roda em iframe.
 * Em DEV, liberamos frame-ancestors para evitar o “símbolo proibido” no Preview.
 * Em PROD, não abrimos (segurança).
 */
app.use((_req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    // Super permissivo em dev para não brigar com os domínios de embed do Replit
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    // Garante que nada esteja bloqueando por X-Frame-Options
    res.removeHeader("X-Frame-Options");
  }
  next();
});

app.use(
  express.json({
    limit: '25mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '25mb' }));

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
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
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

  // Error handler (não derruba o server em dev)
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
