import { FastifyInstance } from "fastify";
import { listDirectoryUsers } from "../services/graph";

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await listDirectoryUsers();
    return { data: users };
  });
}
