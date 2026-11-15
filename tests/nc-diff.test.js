const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function ncDiffCategories(text){');
const end=html.indexOf('async function readNCFile(input)',start);
assert.ok(start>=0&&end>start,'Diff classifier not found');
const ctx=vm.createContext({});
vm.runInContext(html.slice(start,end),ctx);
function classify(s){return Array.from(vm.runInContext('ncDiffCategories('+JSON.stringify(s)+')',ctx))}
assert.ok(classify('12 L X+20 Y-4 F1200').includes('coordinates'));
assert.ok(classify('12 L X+20 Y-4 F1200').includes('feed'));
assert.ok(classify('1 TOOL CALL 1 Z S3000').includes('spindle'));
assert.ok(classify('1 TOOL CALL 1 Z S3000').includes('control'));
assert.ok(classify('5 PLANE SPATIAL SPA+0').includes('control'));
assert.ok(classify('5 M128').includes('control'));
assert.deepEqual(classify('BEGIN PGM TEST MM'),['other']);
console.log('PASS: NC diff categories');
