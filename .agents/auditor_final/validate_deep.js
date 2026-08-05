const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const reportPath = path.join(__dirname, '..', '..', 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Extract code blocks
const codeBlockRegex = /^```([a-z0-9_+-]*)\r?\n([\s\S]*?)^```/gm;

let match;
let blockCount = 0;
const blocks = [];

while ((match = codeBlockRegex.exec(reportContent)) !== null) {
  blockCount++;
  const lang = match[1].toLowerCase().trim();
  const code = match[2];
  const startIndex = match.index;
  const lineNumber = reportContent.substring(0, startIndex).split('\n').length;
  blocks.push({
    index: blockCount,
    lineNumber,
    lang,
    code,
    lines: code.split('\n')
  });
}

console.log(`Deep analyzing ${blocks.length} blocks...`);

// Check for empty functions or stubs
const stubs = [];
blocks.forEach(b => {
  b.lines.forEach((line, idx) => {
    // Check for empty arrow functions or empty block functions like () => {} or function() {}
    if (/(=>\s*\{\s*\}|function\s*\([^)]*\)\s*\{\s*\})/i.test(line)) {
      // Check context to see if it's an intentional no-op callback or stub
      stubs.push({
        blockIndex: b.index,
        lineNum: b.lineNumber + idx,
        line: line.trim()
      });
    }
    // Check for throw new Error("Not implemented") or similar
    if (/not implemented/i.test(line)) {
      stubs.push({
        blockIndex: b.index,
        lineNum: b.lineNumber + idx,
        line: line.trim()
      });
    }
  });
});

console.log(`\n--- POTENTIAL STUBS / EMPTY HANDLERS (${stubs.length}) ---`);
console.log(JSON.stringify(stubs, null, 2));

// Check Section 1 File-by-File completeness (all 37 files)
console.log('\n--- SECTION 1 FILE AUDIT COMPLETENESS CHECK ---');
const fileAuditedRegex = /^### \d+\.\s+`([^`]+)`/gm;
let fileMatch;
const auditedFiles = [];
while ((fileMatch = fileAuditedRegex.exec(reportContent)) !== null) {
  auditedFiles.push(fileMatch[1]);
}

console.log(`Found ${auditedFiles.length} audited files in Section 1:`);
console.log(auditedFiles);

// Expected 37 files under src/
const expected37 = [
  'src/app/_layout.tsx',
  'src/app/(tabs)/_layout.tsx',
  'src/app/(tabs)/index.tsx',
  'src/app/(tabs)/list.tsx',
  'src/app/(tabs)/recipes.tsx',
  'src/app/(tabs)/settings.tsx',
  'src/components/CameraScanner.tsx',
  'src/components/InventoryCard.tsx',
  'src/components/SkeletonLoader.tsx',
  'src/components/UrgencyFilter.tsx',
  'src/components/animated-icon.module.css',
  'src/components/animated-icon.tsx',
  'src/components/animated-icon.web.tsx',
  'src/components/app-tabs.tsx',
  'src/components/app-tabs.web.tsx',
  'src/components/external-link.tsx',
  'src/components/hint-row.tsx',
  'src/components/themed-text.tsx',
  'src/components/themed-view.tsx',
  'src/components/ui/collapsible.tsx',
  'src/components/web-badge.tsx',
  'src/constants/theme.ts',
  'src/context/FridgeContext.tsx',
  'src/global.css',
  'src/hooks/use-color-scheme.ts',
  'src/hooks/use-color-scheme.web.ts',
  'src/hooks/use-theme.ts',
  'src/hooks/useAuth.ts',
  'src/hooks/useFridges.ts',
  'src/hooks/useGroceryList.ts',
  'src/hooks/useInventory.ts',
  'src/lib/ai.ts',
  'src/lib/barcode.ts',
  'src/lib/cache.ts',
  'src/lib/expiration.ts',
  'src/lib/notifications.ts',
  'src/lib/supabase.ts'
];

const missing37 = expected37.filter(f => !auditedFiles.includes(f));
console.log(`Missing files from 37: ${missing37.length}`);
if (missing37.length > 0) {
  console.log('Missing:', missing37);
}
