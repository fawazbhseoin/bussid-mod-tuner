'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse, apply, autoFit, PRESET, ENGINE, HANDLING } = require('../src/core.js');
const { build } = require('../scripts/build.js');
const { buildFixture, DEFAULTS } = require('./fixture.js');

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-4, `${a} is not close to ${b}`);

test('reads every engine and handling value', () => {
  const p = parse(buildFixture());
  assert.deepEqual(p.missing, []);
  for (const n of [...ENGINE, ...HANDLING]) near(p.fields[n].value, DEFAULTS[n]);
});

test('finds two sets of six gears', () => {
  const p = parse(buildFixture());
  assert.equal(p.gears.length, 12);
  assert.deepEqual(p.sets.map((s) => s.length), [6, 6]);
  near(p.gears[0].ratio, 3);
  near(p.gears[5].shift, 120);
});

test('finds a single set of gears', () => {
  const p = parse(buildFixture({}, 1));
  assert.deepEqual(p.sets.map((s) => s.length), [6]);
});

test('apply changes only the edited floats and keeps the file size', () => {
  const original = buildFixture();
  const buf = original.slice();
  const p = parse(buf);
  apply(buf, p, { force: 60000, maxSpeed: 300 });
  assert.equal(buf.length, original.length);
  let differing = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] !== original[i]) differing++;
  assert.ok(differing > 0 && differing <= 8, `unexpected number of changed bytes: ${differing}`);
  const again = parse(buf);
  near(again.fields.force.value, 60000);
  near(again.fields.maxSpeed.value, 300);
  near(again.fields.mass.value, DEFAULTS.mass);
});

test('the fast preset round-trips, including the gearbox', () => {
  const buf = buildFixture();
  const p = parse(buf);
  apply(buf, p, PRESET, autoFit(p, 300));
  const q = parse(buf);
  for (const [n, v] of Object.entries(PRESET)) near(q.fields[n].value, v);
  assert.deepEqual(q.gears.slice(0, 6).map((g) => Math.round(g.shift)), [45, 90, 135, 185, 240, 300]);
  assert.deepEqual(q.gears.slice(6).map((g) => Math.round(g.shift)), [45, 90, 135, 185, 240, 300]);
});

test('autoFit ends at the top speed for any gear count', () => {
  const fake = (n) => ({ gears: Array.from({ length: n }, () => ({ ratio: 1, shift: 1 })), sets: [Array.from({ length: n }, (_, i) => i)] });
  for (const n of [1, 3, 4, 5, 6, 8]) {
    const out = autoFit(fake(n), 250);
    assert.equal(out[n - 1].shift, 250, `${n} gears`);
    for (let i = 1; i < n; i++) assert.ok(out[i].shift > out[i - 1].shift && out[i].ratio <= out[i - 1].ratio);
  }
});

test('unrelated data parses to nothing instead of throwing', () => {
  const junk = new Uint8Array(5000).map((_, i) => (i * 31) % 251);
  const p = parse(junk);
  assert.equal(Object.keys(p.fields).length, 0);
  assert.equal(p.gears.length, 0);
});

test('a missing field is reported, not guessed', () => {
  const buf = buildFixture();
  const text = Buffer.from(buf);
  const at = text.indexOf(Buffer.from('antiRoll'));
  text.write('antiXoll', at, 'latin1');
  const p = parse(new Uint8Array(text));
  assert.deepEqual(p.missing, ['antiRoll']);
});

test('the committed index.html matches a fresh build', () => {
  const committed = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.equal(committed, build(), 'run "npm run build" and commit index.html');
});
