export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "RM API Gateway",
    version: "v1",
  },
  paths: {
    "/healthz": {
      get: {
        responses: {
          "200": { description: "OK" },
        },
      },
    },
  },
} as const;
