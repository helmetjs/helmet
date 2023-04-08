const connect = require("connect");
const supertest = require("supertest");
const helmet = require("helmet");

const handler = (_, res) => res.end("Hello world");

async function testTopLevel() {
  const app = connect().use(helmet()).use(handler);
  await supertest(app)
    .get("/")
    .expect(200, "Hello world")
    .expect("x-download-options", "noopen");
}

async function testMiddleware() {
  const app = connect().use(helmet.frameguard()).use(handler);
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
