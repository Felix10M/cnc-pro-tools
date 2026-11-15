// CNC Pro Tools — dependency-free smoke checks. Run: node tests/smoke.test.js
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(Boolean);
assert.ok(scripts.length >= 3, 'Expected three inline application scripts');
scripts.forEach((source, i) => {
  new vm.Script(source, { filename: 'inline-script-' + (i + 1) + '.js' });
  console.log('PASS: inline script ' + (i + 1) + ' parses');
});
for (const id of ['quoteUnit', 'quoteLot', 'quoteRows', 'quoteError', 'quoteSave', 'quoteExport', 'quotePrint']) {
  assert.match(html, new RegExp('id=["\\\']' + id + '["\\\']'), 'Missing UI element: ' + id);
}
assert.match(html, /Number\.isFinite/, 'Missing finite number guard');
assert.match(html, /function calcQuote\(/, 'Missing quote calculator');
assert.match(html, /function quoteCSV\(/, 'Missing quote export');
assert.match(html, /localStorage/, 'Missing local persistence');
console.log('PASS: quote UI, validation, export and storage markers present');
for (const id of ['ncInput','ncAnalyze','ncExport','ncFilter','ncSaveHistory','ncClearHistory','ncOldFile','ncNewFile','ncCompare','ncDiffExport','ncDiffResults']) {
  assert.ok(html.includes('id="'+id+'"') || html.includes("id='"+id+"'"), 'Missing NC UI element: '+id);
}
assert.match(html,/function compareNCLines\(/,'Missing NC comparison');
assert.match(html,/function ncNumericDelta\(/,'Missing numeric NC comparison');
console.log('PASS: NC review and comparison UI markers present');
console.log('PASS: static smoke checks completed (browser interaction NOT tested)');
