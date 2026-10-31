#!/usr/bin/env node
// Builds the single-file app (index.html) by inlining src/core.js into src/page.html.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function build() {
  const core = fs.readFileSync(path.join(root, 'src/core.js'), 'utf8')
    .replace("if(typeof module!=='undefined')module.exports={parse,apply,autoFit,PRESET,ENGINE,HANDLING};", '');
  const page = fs.readFileSync(path.join(root, 'src/page.html'), 'utf8');
  return page.replace('/*CORE*/', () => core);
}

if (require.main === module) {
  fs.writeFileSync(path.join(root, 'index.html'), build());
  console.log('Built index.html');
}
module.exports = { build };
