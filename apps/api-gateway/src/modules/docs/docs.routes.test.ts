import request from "supertest";
import express from "express";
import { buildDocsRouter } from "./docs.routes.js";

describe("api-gateway docs routes", () => {
  test("GET /docs/ serves swagger UI", async () => {
    const app = express();
    app.use(buildDocsRouter());

    const res = await request(app).get("/docs/").expect(200);
    expect(res.header["content-type"]).toContain("text/html");
    expect(res.text).toContain("Swagger UI");
  });
});
