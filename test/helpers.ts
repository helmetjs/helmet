import type { IncomingMessage, ServerResponse } from "http";
import connect from "connect";
import supertest from "supertest";

type MiddlewareFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

export async function check(
  middleware: MiddlewareFunction,
  expectedHeaders: Readonly<Record<string, string | null>>
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
      expect(response.header).not.toHaveProperty(headerName);
    } else {
      expect(response.header).toHaveProperty(headerName, headerValue);
    }
  }

  return response;
}
