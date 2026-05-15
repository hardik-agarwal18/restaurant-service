import { z } from "zod";
import { JwtEnvSchema, verifyAccessToken } from "@rm/auth";
import { getPrisma } from "@rm/db";
import {
  asyncHandler,
  createBaseApp,
  createLogger,
  errorHandler,
  getContext,
  notFoundHandler,
  setContext,
  tenantMiddleware,
} from "@rm/platform";

const logger = createLogger("restaurant-service");
const prisma = getPrisma();
const jwtEnv = JwtEnvSchema.parse(process.env);

const app = createBaseApp(logger);
app.use(tenantMiddleware());
app.use((req, _res, next) => {
  const auth = req.header("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const principal = verifyAccessToken(jwtEnv, auth.slice("Bearer ".length));
      setContext(req, {
        tenantId: principal.tenantId,
        userId: principal.userId,
        roles: principal.roles,
        permissions: principal.permissions,
      });
    } catch {
      // ignore
    }
  }
  next();
});

app.get(
  "/v1/restaurants",
  asyncHandler(async (req, res) => {
    const ctx = getContext(req);
    if (!ctx.tenantId) return res.status(401).json({ error: "UNAUTHORIZED" });
    const restaurants = await prisma.restaurant.findMany({ where: { tenantId: ctx.tenantId } });
    res.status(200).json(restaurants);
  })
);

app.post(
  "/v1/branches",
  asyncHandler(async (req, res) => {
    const ctx = getContext(req);
    if (!ctx.tenantId || !ctx.permissions?.includes("admin:manage")) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    const body = z
      .object({
        restaurantId: z.string().min(1),
        name: z.string().min(1),
        addressLine1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        phone: z.string().optional(),
      })
      .parse(req.body);
    const created = await prisma.branch.create({ data: { tenantId: ctx.tenantId, ...body } });
    res.status(201).json(created);
  })
);

app.use(notFoundHandler);
app.use(errorHandler(logger));
const port = Number(process.env.PORT || 3006);
app.listen(port, () => logger.info({ port }, "restaurant-service listening"));
