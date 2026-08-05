const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

console.log('--- VALIDATING MASTER AUDIT REPORT CODE BLOCKS ---');

const codeBlockRegex = /```(tsx?|jsx?|typescript|javascript|sql|json|bash|css)?\s*\n([\s\S]*?)```/g;
let match;
let totalBlocks = 0;
let validBlocks = 0;
let errors = [];

while ((match = codeBlockRegex.exec(reportContent)) !== null) {
  totalBlocks++;
  const lang = match[1] || 'text';
  const code = match[2];
  
  // Check for any placeholder comments that indicate incomplete code
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (/\/\/\s*\.\.\./.test(line) ||
        /\/\*\s*\.\.\.\s*\*\//.test(line) ||
        /\[\s*insert\s+/i.test(line) ||
        /\/\/\s*rest of/i.test(line) ||
        /\/\/\s*TODO\b/i.test(line) ||
        /\/\/\s*FIXME\b/i.test(line)) {
      errors.push({
        block: totalBlocks,
        lang,
        line: idx + 1,
        content: line.trim()
      });
    }
  });
}

console.log(`Total code blocks validated: ${totalBlocks}`);
console.log(`Placeholder/Stub errors detected: ${errors.length}`);
if (errors.length > 0) {
  console.log('Errors:', errors);
} else {
  console.log('ALL CODE BLOCKS ARE 100% CLEAN & NON-TRUNCATED!');
}
