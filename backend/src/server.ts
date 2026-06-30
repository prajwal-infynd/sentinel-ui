import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// Request Logger Middleware
// ─────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const BLUE = "\x1b[34m";

function getMethodColor(method: string): string {
  switch (method) {
    case "GET":    return GREEN;
    case "POST":   return BLUE;
    case "PATCH":  return YELLOW;
    case "DELETE": return RED;
    default:       return MAGENTA;
  }
}

function getStatusColor(status: number): string {
  if (status >= 500) return RED;
  if (status >= 400) return YELLOW;
  if (status >= 300) return CYAN;
  return GREEN;
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const methodColor = getMethodColor(req.method);
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${DIM}[${timestamp}]${RESET} ` +
      `${BOLD}${methodColor}${req.method.padEnd(6)}${RESET} ` +
      `${CYAN}${req.originalUrl}${RESET} ` +
      `${BOLD}${statusColor}${res.statusCode}${RESET} ` +
      `${DIM}${ms}ms${RESET}`
    );

    // Log request body for POST/PATCH (skip sensitive auth)
    if (["POST", "PATCH"].includes(req.method) && !req.path.includes("/auth/")) {
      if (Object.keys(req.body || {}).length > 0) {
        console.log(`  ${DIM}↳ body: ${JSON.stringify(req.body)}${RESET}`);
      }
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.log(`  ${RED}↳ [ERROR] ${req.method} ${req.originalUrl} failed with ${res.statusCode}${RESET}`);
    }
  });

  next();
});

import apiRoutes from "./routes/api";

app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   🛡  Sentinel Backend  🛡            ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}`);
  console.log(`  ${GREEN}${BOLD}✓${RESET} Server running on port ${BOLD}${PORT}${RESET}`);
  console.log(`  ${GREEN}${BOLD}✓${RESET} Health: ${CYAN}http://localhost:${PORT}/api/health${RESET}`);
  console.log(`  ${DIM}Watching for requests...${RESET}\n`);
});
