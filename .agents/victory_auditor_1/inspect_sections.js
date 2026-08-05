const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

const lines = reportContent.split('\n');
console.log('--- TABLE OF CONTENTS & SECTION HEADERS ---');
lines.forEach((line, index) => {
  if (line.startsWith('#') || line.startsWith('##') || line.startsWith('###') || line.startsWith('####')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
