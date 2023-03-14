import type { IncomingMessage, ServerResponse } from "http";
import connect from "connect";
import supertest from "supertest";
import helmet, { frameguard } from "../../../dist/esm/index.js";

const handler = (_: IncomingMessage, res: ServerResponse) =>
  res.end("Hello world");

async function testTopLevel() {
  const app = connect().use(helmet()).use(handler);
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-download-options", "noopen");
}

async function testImportedMiddleware() {
  const app = connect().use(frameguard()).use(handler);
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-frame-options", "SAMEORIGIN");
}

async function testAttachedMiddleware() {
  const app = connect().use(helmet.frameguard()).use(handler);
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-frame-options", "SAMEORIGIN");
}

async function main() {
  await testTopLevel();
  await testImportedMiddleware();
  await testAttachedMiddleware();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
