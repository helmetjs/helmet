import connect from "connect";
import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import supertest from "supertest";

type MiddlewareFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void;

export async function check(
  middleware: MiddlewareFunction,
  expectedHeaders: Readonly<Record<string, string | null>>,
) {
  const app = connect()
    .use((_req, res, next) => {
      res.setHeader("X-Powered-By", "Helmet test");
      next();
    })
    .use(middleware)
    .use((_req: IncomingMessage, res: ServerResponse) => {
      res.end("Hello world!");
    });

  const response = await supertest(app).get("/").expect(200, "Hello world!");

  for (const [headerName, headerValue] of Object.entries(expectedHeaders)) {
    if (headerValue === null) {
      assert(
        !(headerName in response.header),
        `${headerName} should not be set`,
      );
    } else {
      assert.equal(
        response.header[headerName],
        headerValue,
        `${headerName} should have value ${headerValue}`,
      );
    }
  }

  return response;
}
