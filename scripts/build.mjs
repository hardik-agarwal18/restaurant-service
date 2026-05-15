import { spawnSync } from "node:child_process";

const packages = ["@rm/platform", "@rm/auth", "@rm/events", "@rm/db"];
const apps = [
  "@rm/api-gateway",
  "@rm/auth-service",
  "@rm/order-service",
  "@rm/inventory-service",
  "@rm/pos-service",
  "@rm/notification-service",
  "@rm/realtime-service",
  "@rm/restaurant-service",
  "@rm/user-service",
  "@rm/payment-service",
  "@rm/delivery-service",
  "@rm/analytics-service",
  "@rm/ai-recommendation-service",
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

for (const ws of packages) {
  run("npm", ["run", "build", "-w", ws]);
}

for (const ws of apps) {
  run("npm", ["run", "build", "-w", ws]);
}
