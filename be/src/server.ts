import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { env } from "./env";
import { prisma } from "./db";
import { verifyAccessToken } from "./auth";
import { registerTicketRoutes } from "./routes/tickets";
import { registerUserRoutes } from "./routes/users";

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);

  // Global auth guard (skip if SKIP_AUTH=true).
  if (!env.SKIP_AUTH) {
    app.addHook("preHandler", async (request) => {
      if (request.routerPath === "/health") return;

      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw app.httpErrors.unauthorized("Missing bearer token");
      }

      const token = authHeader.slice("Bearer ".length);
      try {
        const payload = await verifyAccessToken(token);
        request.user = payload;
      } catch (error) {
        request.log.warn({ err: error }, "Token validation failed");
        throw app.httpErrors.unauthorized("Invalid token");
      }
    });
  }

  app.get("/health", async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
  }));

  await app.register(registerTicketRoutes, { prefix: "/tickets" });
  await app.register(registerUserRoutes, { prefix: "/users" });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

async function start() {
  const app = await buildServer();

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
