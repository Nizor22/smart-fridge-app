const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const masterReportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const agentsDir = path.join(rootDir, '.agents');

const specialistReports = [
  path.join(agentsDir, 'rn_engineer_1', 'report.md'),
  path.join(agentsDir, 'ui_ux_designer_1', 'report.md'),
  path.join(agentsDir, 'security_auditor_1', 'report.md'),
  path.join(agentsDir, 'product_strategist_1', 'report.md'),
];

console.log('=== FORENSIC AUDIT SCANNER ===');

// Function to check placeholder patterns in a file
function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING] ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`\nAuditing: ${path.basename(filePath)} (${lines.length} lines, ${content.length} bytes)`);

  const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  let match;
  let codeBlockCount = 0;
  let placeholderCount = 0;
  const suspiciousLines = [];

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlockCount++;
    const lang = match[1];
    const code = match[2];
    const codeLines = code.split('\n');

    codeLines.forEach((line, idx) => {
      // Check for placeholder indicators inside code blocks
      const lower = line.toLowerCase();
      if (
        line.includes('// ...') ||
        line.includes('/* ... */') ||
        line.includes('// TODO') ||
        line.includes('// todo') ||
        line.includes('/* TODO') ||
        lower.includes('implement here') ||
        lower.includes('add logic here') ||
        lower.includes('insert code here') ||
        lower.includes('your code here') ||
        lower.includes('rest of implementation') ||
        lower.includes('placeholder')
      ) {
        placeholderCount++;
        suspiciousLines.push({ block: codeBlockCount, lineNo: idx + 1, text: line.trim() });
      }
    });
  }

  console.log(`- Code blocks found: ${codeBlockCount}`);
  console.log(`- Suspicious code lines / placeholders: ${placeholderCount}`);

  if (suspiciousLines.length > 0) {
    console.log('  Details of suspicious lines:');
    suspiciousLines.forEach((s) => {
      console.log(`    Block ${s.block}, Code Line ${s.lineNo}: ${s.text}`);
    });
  }

  return {
    filePath,
    lineCount: lines.length,
    codeBlockCount,
    placeholderCount,
    suspiciousLines,
  };
}

const masterResults = checkFile(masterReportPath);
const specialistResults = specialistReports.map(checkFile);

console.log('\n=== AUDIT SUMMARY ===');
console.log(`Master Report Code Blocks: ${masterResults.codeBlockCount}, Placeholders: ${masterResults.placeholderCount}`);
specialistResults.forEach((r) => {
  if (r) {
    console.log(`${path.basename(path.dirname(r.filePath))}: Code Blocks: ${r.codeBlockCount}, Placeholders: ${r.placeholderCount}`);
  }
});
