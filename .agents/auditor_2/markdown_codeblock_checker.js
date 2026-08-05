const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const filesToCheck = [
  path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md'),
  path.join(rootDir, '.agents', 'rn_engineer_1', 'report.md'),
  path.join(rootDir, '.agents', 'ui_ux_designer_1', 'report.md'),
  path.join(rootDir, '.agents', 'security_auditor_1', 'report.md'),
  path.join(rootDir, '.agents', 'product_strategist_1', 'report.md'),
];

console.log('=== MARKDOWN CODE BLOCK INTEGRITY SCANNER ===\n');

filesToCheck.forEach(file => {
  if (!fs.existsSync(file)) return;
  const relativePath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  let inBlock = false;
  let blockStartLine = 0;
  let blockLang = '';
  let totalBlocks = 0;
  let brokenBlocks = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      if (!inBlock) {
        inBlock = true;
        blockStartLine = lineNo;
        blockLang = trimmed.replace('```', '').trim();
        totalBlocks++;
      } else {
        // Closing block or premature block closing
        inBlock = false;
        // Check if next lines look like raw code instead of markdown text
        const nextLines = lines.slice(index + 1, index + 6).join('\n');
        if (
          nextLines.includes('return new Response') ||
          nextLines.includes('const ') ||
          nextLines.includes('function ') ||
          nextLines.includes('import ') ||
          nextLines.includes('export ')
        ) {
          brokenBlocks.push({
            start: blockStartLine,
            closedAt: lineNo,
            lang: blockLang,
            snippet: line
          });
        }
      }
    }
  });

  console.log(`File: ${relativePath}`);
  console.log(`  Total code blocks detected: ${totalBlocks}`);
  console.log(`  Prematurely closed code blocks: ${brokenBlocks.length}`);
  if (brokenBlocks.length > 0) {
    brokenBlocks.forEach(b => {
      console.log(`    Block started line ${b.start}, prematurely closed line ${b.closedAt} by: ${b.snippet}`);
    });
  }
});
