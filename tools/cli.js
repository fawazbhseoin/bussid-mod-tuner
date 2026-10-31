#!/usr/bin/env node
'use strict';
// Command-line version of the tuner, for people who prefer a terminal or want to script it.
//   node tools/cli.js mod.bussidmod                        print current values
//   node tools/cli.js mod.bussidmod out.bussidmod --preset fast300
//   node tools/cli.js mod.bussidmod out.bussidmod --set force=45000 maxSpeed=250 --fit-gears
const fs = require('fs');
const { parse, apply, autoFit, PRESET, ENGINE, HANDLING } = require('../src/core.js');

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes('-h') || argv.includes('--help')) {
  console.log(`BUSSID Mod Tuner (CLI)
Usage: node tools/cli.js <input> [output] [options]
  --preset fast300       apply the 300 km/h preset (also fits the gears)
  --set name=value ...   set any value (run without options to see the names)
  --fit-gears            rebuild the gear table for the final top speed
Without an output file, current values are printed and nothing is written.`);
  process.exit(0);
}

const files = [];
const sets = {};
let preset = false;
let fit = false;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--preset') { if (argv[++i] !== 'fast300') { console.error('Unknown preset. Available: fast300'); process.exit(1); } preset = true; }
  else if (a === '--fit-gears') fit = true;
  else if (a === '--set') {
    while (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      const [k, v] = argv[++i].split('=');
      const num = Number(v);
      if (!k || !Number.isFinite(num)) { console.error(`Bad value: ${argv[i]} (use name=number)`); process.exit(1); }
      sets[k] = num;
    }
  } else files.push(a);
}
const [input, output] = files;
const buf = new Uint8Array(fs.readFileSync(input));
const parsed = parse(buf);
if (Object.keys(parsed.fields).length === 0) {
  console.error('No vehicle settings found. This does not look like a BUSSID vehicle mod, or it uses a different layout.');
  process.exit(2);
}
const known = new Set([...ENGINE, ...HANDLING]);
for (const k of Object.keys(sets)) if (!known.has(k)) { console.error(`Unknown setting: ${k}`); process.exit(1); }

const vals = { ...(preset ? PRESET : {}), ...sets };
const topSpeed = vals.maxSpeed ?? parsed.fields.maxSpeed?.value ?? 100;
const gears = (preset || fit) ? autoFit(parsed, topSpeed) : null;

for (const n of [...ENGINE, ...HANDLING]) {
  const f = parsed.fields[n];
  if (!f) continue;
  const to = vals[n];
  console.log(`${n.padEnd(26)} ${String(Math.round(f.value * 1000) / 1000).padStart(10)}${to !== undefined ? '  ->  ' + to : ''}`);
}
parsed.gears.forEach((g, k) => {
  const to = gears && gears[k];
  console.log(`gear ${String(k + 1).padStart(2)}  ratio ${g.ratio.toFixed(2)}  shift ${Math.round(g.shift)}${to ? `  ->  ratio ${to.ratio}  shift ${to.shift}` : ''}`);
});

if (output) {
  apply(buf, parsed, vals, gears);
  fs.writeFileSync(output, buf);
  console.log(`\nWrote ${output}`);
}
