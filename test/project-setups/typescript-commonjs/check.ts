import helmet, { frameguard } from "helmet";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import supertest from "supertest";

const createApp = (
  middleware: (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void,
  ) => void,
) =>
  createServer((req, res) => {
    middleware(req, res, (err) => {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        res.end("Hello world");
      }
    });
  });

async function testTopLevel() {
  const app = createApp(helmet());
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-download-options", "noopen");
}

async function testImportedMiddleware() {
  const app = createApp(frameguard());
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-frame-options", "SAMEORIGIN");
}

async function testAttachedMiddleware() {
  const app = createApp(helmet.frameguard());
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
