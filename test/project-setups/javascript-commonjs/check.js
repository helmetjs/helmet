const { createServer } = require("node:http");
const supertest = require("supertest");
const helmet = require("helmet");

const createApp = (middleware) =>
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

async function testMiddleware() {
  const app = createApp(helmet.frameguard());
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-frame-options", "SAMEORIGIN");
}

async function main() {
  await testTopLevel();
  await testMiddleware();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
