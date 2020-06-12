import { IncomingMessage, ServerResponse } from "http";
import connect = require("connect");
import supertest = require("supertest");

interface MiddlewareFunction {
  (req: IncomingMessage, res: ServerResponse, next: () => void): void;
}

export async function check(
  middleware: MiddlewareFunction,
  expectedHeaders: Readonly<{ [headerName: string]: string | null }>
): Promise<void> {
  const app = connect()
    .use(middleware)
    .use((_req: IncomingMessage, res: ServerResponse) => {
      res.end("Hello world!");
    });

  const { header } = await supertest(app).get("/").expect(200, "Hello world!");

  for (const [headerName, headerValue] of Object.entries(expectedHeaders)) {
    if (headerValue === null) {
      expect(header).not.toHaveProperty(headerName);
    } else {
      expect(header).toHaveProperty(headerName, headerValue);
    }
  }
}
