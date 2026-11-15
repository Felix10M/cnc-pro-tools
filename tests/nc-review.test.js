// Regression tests for the actual NC heuristic analyzer in index.html.
// Run: node tests/nc-review.test.js
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function analyzeNC(source,controller){');
const end=html.indexOf('function render(){',start);
assert.ok(start>=0&&end>start,'NC analyzer function missing');
const ctx=vm.createContext({});
vm.runInContext(html.slice(start,end),ctx);
const analyze=(source,controller)=>vm.runInContext('analyzeNC('+JSON.stringify(source)+','+JSON.stringify(controller)+')',ctx);
let hits=analyze('0 BEGIN PGM TEST MM\n1 TOOL CALL 1 Z S3000\n2 L Z+100 R0 FMAX\n3 END PGM TEST MM','640');
assert.ok(hits.some(x=>x.line===3&&x.ro.includes('FMAX')),'Rapid move warning missing');
console.log('PASS: rapid move line warning');
hits=analyze('BEGIN PGM TEST MM\nFUNCTION TCPM\nEND PGM TEST MM','530');
assert.ok(hits.some(x=>x.ro.includes('TNC 530')),'TNC 530 contextual warning missing');
console.log('PASS: TNC 530 context');
hits=analyze('BEGIN PGM TEST MM\nPLANE SPATIAL\nEND PGM TEST MM','426');
assert.ok(hits.some(x=>x.ro.includes('TNC 426')),'TNC 426 contextual warning missing');
console.log('PASS: TNC 426 context');
hits=analyze('BEGIN PGM TEST MM\nM128\nEND PGM TEST MM','640');
assert.ok(hits.some(x=>x.ro.includes('TNC 640')),'TNC 640 contextual warning missing');
console.log('PASS: TNC 640 context');
hits=analyze('','620');
assert.ok(hits.some(x=>x.ro.includes('Introdu')),'Empty input message missing');
console.log('PASS: empty input');
hits=analyze('X'.repeat(100001),'620');
assert.ok(hits.some(x=>x.level==='error'),'Input limit missing');
console.log('PASS: size limit');

hits=analyze('BEGIN PGM TEST MM\nL A+90 B-15 FMAX\nPLANE RESET\nCYCL DEF 19.0 WORKING PLANE\nM129\nEND PGM TEST MM','530');
assert.ok(hits.some(x=>x.ro.includes('Coordonată rotativă')),'Rotary axis warning missing');
assert.ok(hits.some(x=>x.ro.includes('PLANE RESET')),'Plane reset warning missing');
assert.ok(hits.some(x=>x.ro.includes('Ciclu 19')),'Cycle 19 warning missing');
assert.ok(hits.some(x=>x.ro.includes('M129')),'M129 warning missing');
console.log('PASS: 5-axis transitional command checks');
