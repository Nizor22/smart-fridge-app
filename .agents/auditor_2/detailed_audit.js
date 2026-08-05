const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const masterReportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const originalRequestPath = path.join(rootDir, '.agents', 'ORIGINAL_REQUEST.md');

console.log('=== DETAILED FORENSIC INTEGRITY AUDIT ===');

const masterContent = fs.readFileSync(masterReportPath, 'utf-8');
const originalReqContent = fs.readFileSync(originalRequestPath, 'utf-8');

// 1. Check all 37 source files in src/
const srcDir = path.join(rootDir, 'src');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const allSrcFiles = getAllFiles(srcDir);
const relSrcFiles = allSrcFiles.map((p) => path.relative(rootDir, p).replace(/\\/g, '/'));

console.log(`Total source files in src/: ${relSrcFiles.length}`);

// Check if master report mentions every single source file
const missingSrcFiles = [];
relSrcFiles.forEach((file) => {
  if (!masterContent.includes(file) && !masterContent.includes(path.basename(file))) {
    missingSrcFiles.push(file);
  }
});

console.log(`Source files audited in master report: ${relSrcFiles.length - missingSrcFiles.length} / ${relSrcFiles.length}`);
if (missingSrcFiles.length > 0) {
  console.log('Missing source files in report:', missingSrcFiles);
}

// 2. Check Acceptance Criteria
const acRegex = /- \[ \] (Phase \d — [^\n]+|\*\*([^\*]+)\*\*:? [^\n]+|[^\n]+)/g;
const reqLines = originalReqContent.split('\n');
const acceptanceCriteria = [];
let inACSection = false;

reqLines.forEach((line) => {
  if (line.includes('## Acceptance Criteria')) {
    inACSection = true;
  } else if (line.startsWith('## ') && inACSection) {
    inACSection = false;
  } else if (inACSection && line.trim().startsWith('- [')) {
    acceptanceCriteria.push(line.trim());
  }
});

console.log(`\nAcceptance Criteria count in ORIGINAL_REQUEST.md: ${acceptanceCriteria.length}`);
acceptanceCriteria.forEach((ac, idx) => {
  console.log(`  AC ${idx + 1}: ${ac}`);
});

// 3. Search for Omitted / Truncated Code Block indicators in master report
const truncatedPatterns = [
  /\/\/ \.\.\./,
  /\/\* \.\.\. \*\//,
  /\/\/ rest of/i,
  /\/\/ remaining/i,
  /\/\/ TODO/i,
  /undefined as any/,
  /any;/
];

const lines = masterContent.split('\n');
let codeBlockIndex = 0;
let inCodeBlock = false;
let currentBlockLang = '';
let currentBlockLines = [];
let truncatedMatches = [];

lines.forEach((line, lineIdx) => {
  if (line.startsWith('```')) {
    if (!inCodeBlock) {
      inCodeBlock = true;
      codeBlockIndex++;
      currentBlockLang = line.replace('```', '').trim();
      currentBlockLines = [];
    } else {
      inCodeBlock = false;
      // Check block content
      const blockText = currentBlockLines.join('\n');
      truncatedPatterns.forEach((pat) => {
        if (pat.test(blockText)) {
          truncatedMatches.push({
            block: codeBlockIndex,
            lang: currentBlockLang,
            line: lineIdx + 1,
            pattern: pat.toString(),
            sample: blockText.substring(0, 100).replace(/\n/g, ' ')
          });
        }
      });
    }
  } else if (inCodeBlock) {
    currentBlockLines.push(line);
  }
});

console.log(`\nTotal code blocks in master report: ${codeBlockIndex}`);
console.log(`Truncated / Shortcut patterns matched: ${truncatedMatches.length}`);
truncatedMatches.forEach((m) => {
  console.log(`  Block #${m.block} (${m.lang}) around line ${m.line}: Matched ${m.pattern}`);
});
