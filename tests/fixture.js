'use strict';
// Builds a small SYNTHETIC buffer that imitates the parts of a BUSSID vehicle mod
// this tool reads. It is not a playable mod and contains no one's work.
// Layout (see docs/FORMAT.md): named float entries are stored as
//   [length byte][ASCII name][float32 little-endian]
// and gear entries after the first one refer back to the first "ratio" and
// "shiftNextSpeed" strings by object id:  09 [id: 4 bytes] [float32].

const DEFAULTS = {
  force: 14500, maxRPM: 5000, idleRPM: 800, shiftUpRPM: 1400, maxSpeed: 120,
  mass: 15500, centerOfMassHeightOffset: 0, tireFriction: 3, antiRoll: 0.3,
  maxSteerAngle: 35, rollingResistance: 0.15, maxBrakeForce: 197625,
  tractionControlRatio: 0.9, brakeAssistRatio: 0.9, steeringLimitRatio: 1, steeringAssistRatio: 0.5,
};
const GEAR_RATIOS = [3, 2, 1, 0.5, 0.4, 0.3];
const GEAR_SHIFT = [20, 40, 60, 80, 100, 120];

const f32 = (v) => { const b = Buffer.alloc(4); b.writeFloatLE(v); return b; };
const key = (name) => Buffer.concat([Buffer.from([name.length]), Buffer.from(name, 'latin1')]);
const filler = (n, byte = 0x20) => Buffer.alloc(n, byte);
const entry = (name, v) => Buffer.concat([key(name), f32(v), filler(6)]);

function buildFixture(overrides = {}, gearSets = 2) {
  const v = { ...DEFAULTS, ...overrides };
  const parts = [filler(256)];

  // Handling block
  for (const n of ['mass', 'centerOfMassHeightOffset', 'tireFriction', 'antiRoll', 'maxSteerAngle',
    'rollingResistance', 'maxBrakeForce', 'tractionControlRatio', 'brakeAssistRatio',
    'steeringLimitRatio', 'steeringAssistRatio']) parts.push(entry(n, v[n]));
  parts.push(filler(300));

  // Engine block
  for (const n of ['force', 'maxRPM', 'idleRPM', 'shiftUpRPM', 'maxSpeed']) parts.push(entry(n, v[n]));
  parts.push(filler(300));

  // Gear table: first gear defines the strings, the others refer to them.
  const RATIO_ID = Buffer.from([0xf5, 0x0f, 0, 0]);
  const SHIFT_ID = Buffer.from([0xf7, 0x0f, 0, 0]);
  parts.push(key('gears'), filler(20));
  for (let s = 0; s < gearSets; s++) {
    for (let k = 0; k < 6; k++) {
      if (s === 0 && k === 0) {
        parts.push(Buffer.from([6]), RATIO_ID, key('ratio'), f32(GEAR_RATIOS[k]), filler(12));
        parts.push(Buffer.from([6]), SHIFT_ID, key('shiftNextSpeed'), f32(GEAR_SHIFT[k]), filler(40));
      } else {
        parts.push(Buffer.from([9]), RATIO_ID, f32(GEAR_RATIOS[k]), filler(12));
        parts.push(Buffer.from([9]), SHIFT_ID, f32(GEAR_SHIFT[k]), filler(40));
      }
    }
  }
  parts.push(filler(128));
  return new Uint8Array(Buffer.concat(parts));
}

module.exports = { buildFixture, DEFAULTS, GEAR_RATIOS, GEAR_SHIFT };
