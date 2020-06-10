import helmet = require("..");

import { IncomingMessage, ServerResponse } from "http";
import connect = require("connect");
import request = require("supertest");

describe("helmet() integration test", function () {
  it("sets all default headers", function () {
    const app = connect();
    app.use(helmet());
    app.use((_req: IncomingMessage, res: ServerResponse) => {
      res.end("Hello world!");
    });

    const nonempty = /./;
    return request(app)
      .get("/")
      .expect("X-DNS-Prefetch-Control", nonempty)
      .expect("X-Frame-Options", nonempty)
      .expect("Strict-Transport-Security", nonempty)
      .expect("X-Download-Options", nonempty)
      .expect("X-Content-Type-Options", nonempty)
      .expect("X-XSS-Protection", nonempty);
  });
});
