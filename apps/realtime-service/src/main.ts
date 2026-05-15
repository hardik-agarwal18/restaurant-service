import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { EventBus } from "@rm/events";
import { createBaseApp, createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { Redis } from "ioredis";
import { EnvSchema } from "./env.js";
import { RealtimeService } from "./modules/realtime/realtime.service.js";
import { registerRealtimeSubscriptions } from "./modules/realtime/realtime.subscriptions.js";

const env = EnvSchema.parse(process.env);
const logger = createLogger("realtime-service");

const app = createBaseApp(logger);
app.use(notFoundHandler);
app.use(errorHandler(logger));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

const pub = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const sub = pub.duplicate();
io.adapter(createAdapter(pub, sub));

const service = new RealtimeService(io);

io.on("connection", (socket) => service.onConnection(socket));

const bus = new EventBus(env.REDIS_URL, logger);
await bus.connect();
await registerRealtimeSubscriptions(bus, service);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "realtime-service listening");
});
