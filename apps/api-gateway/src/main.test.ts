import request from "supertest";
import express from "express";

test("healthz returns ok", async () => {
  const app = express();
  app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));
  await request(app).get("/healthz").expect(200);
});
