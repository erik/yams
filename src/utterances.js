import 'babel-core/polyfill';
import fs from 'fs';

var baseUtterances = fs.readFileSync('utterances.txt');
var originalMappings = JSON.parse(fs.readFileSync('mappings.json'));
var mappings = {};

for (let k in originalMappings) {
  mappings[k.toLowerCase()] = originalMappings[k];
}

export function genUdderances() {
  let lines = [];
  for (let k in originalMappings) {
    lines.push(`SetInput switch to {${k}|Input}`);
    lines.push(`SetInput switch input to {${k}|Input}`);
    lines.push(`SetInput switch inputs to {${k}|Input}`);
  }

  return baseUtterances + lines.sort().join('\n');
}
export { mappings };
