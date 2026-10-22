const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

test('GET /health renvoie ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /greet utilise le paramètre name', async () => {
  const res = await fetch(`${base}/greet?name=Alice`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { greeting: 'Hello, Alice!' });
});

test('GET /ping rejette un hôte contenant des caractères dangereux', async () => {
  const res = await fetch(`${base}/ping?host=${encodeURIComponent('8.8.8.8; id')}`);
  assert.strictEqual(res.status, 400);
});

test('les en-têtes de sécurité sont présents', async () => {
  const res = await fetch(`${base}/`);
  assert.ok(res.headers.get('x-content-type-options'));
  assert.strictEqual(res.headers.get('x-powered-by'), null);
});
