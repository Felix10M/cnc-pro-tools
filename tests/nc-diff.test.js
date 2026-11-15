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

const startNumeric=html.indexOf('function ncNumericWords(line){');
const endNumeric=html.indexOf('function ncDiffCategories(text){',startNumeric);
assert.ok(startNumeric>=0&&endNumeric>startNumeric,'Numeric diff helpers not found');
vm.runInContext(html.slice(startNumeric,endNumeric),ctx);
const deltas=Array.from(vm.runInContext("ncNumericDelta('10 L X+50 Y+20 F2000','10 L X+55 Y+20 F1500')",ctx));
assert.equal(deltas.length,2);
assert.equal(deltas[0].axis,'X');
assert.equal(deltas[0].delta,5);
assert.equal(deltas[1].axis,'F');
assert.equal(deltas[1].delta,-500);
assert.equal(vm.runInContext("ncNumericDelta('L X+Q10','L X+20').length",ctx),0);
for(const order of ['added','removed']){
 const changes=order==='added'?[{kind:'added',line:2,text:'L X+55 F1500'},{kind:'removed',line:2,text:'L X+50 F2000'}]:[{kind:'removed',line:2,text:'L X+50 F2000'},{kind:'added',line:2,text:'L X+55 F1500'}];
 const pairs=Array.from(vm.runInContext('ncDiffPairs('+JSON.stringify(changes)+')',ctx));
 assert.equal(pairs.length,1);
}
console.log('PASS: NC numeric differences');
