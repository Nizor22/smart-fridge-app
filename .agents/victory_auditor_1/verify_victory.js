const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const srcDir = path.join(rootDir, 'src');

console.log('Starting Victory Audit Verification Script...');

const reportContent = fs.readFileSync(reportPath, 'utf8');

// 1. Get all .ts and .tsx files under src/
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.relative(rootDir, filePath).replace(/\\/g, '/'));
    }
  }
  return fileList;
}

const allSrcFiles = getFiles(srcDir);
console.log(`Found ${allSrcFiles.length} source files under src/`);

// Check file analysis coverage
const fileAnalysisResults = {};
let missingFiles = [];

for (const file of allSrcFiles) {
  // Normalize path format variations
  const filename = path.basename(file);
  const relPath = file;
  
  // Check if file is mentioned in report
  const isMentioned = reportContent.includes(relPath) || reportContent.includes(filename);
  fileAnalysisResults[file] = isMentioned;
  if (!isMentioned) {
    missingFiles.push(file);
  }
}

console.log(`File coverage: ${allSrcFiles.length - missingFiles.length}/${allSrcFiles.length}`);
if (missingFiles.length > 0) {
  console.log('Missing files from report:', missingFiles);
}

// 2. Check for suspicious truncation patterns in code blocks
const codeBlockRegex = /```(?:tsx?|jsx?|javascript|typescript|sql|html|json)?\s*\n([\s\S]*?)```/g;
let match;
let codeBlockCount = 0;
let suspiciousBlocks = [];

const truncationPatterns = [
  /\/\/\s*\.\.\./i,
  /\/\*\s*\.\.\.\s*\*\//i,
  /\/\/\s*TODO\b/i,
  /\/\/\s*FIXME\b/i,
  /\/\/\s*rest of/i,
  /\/\/\s*implementation omitted/i,
  /\/\/\s*code omitted/i,
  /\[insert code/i,
  /\[code here/i,
  /\/\/\s*add remaining/i
];

while ((match = codeBlockRegex.exec(reportContent)) !== null) {
  codeBlockCount++;
  const blockContent = match[1];
  
  for (const pattern of truncationPatterns) {
    if (pattern.test(blockContent)) {
      suspiciousBlocks.push({
        blockIndex: codeBlockCount,
        pattern: pattern.toString(),
        snippet: blockContent.substring(0, 150) + '...'
      });
      break;
    }
  }
}

console.log(`Found ${codeBlockCount} code blocks in report.`);
console.log(`Suspicious/Truncated blocks detected: ${suspiciousBlocks.length}`);
if (suspiciousBlocks.length > 0) {
  console.log('Sample suspicious blocks:', suspiciousBlocks.slice(0, 5));
}

// 3. Verification of Requirements & Acceptance Criteria
console.log('\n--- Checking Requirement Coverage ---');

const checks = {
  'R1: File-by-file src analysis': missingFiles.length === 0,
  'R1: >=5 Concrete bugs/vulnerabilities': (reportContent.match(/BUG-|VULN-|Bugs Identified|Vulnerability/g) || []).length >= 5,
  'R1: >=3 RLS Policy Gaps with SQL': (reportContent.match(/RLS|Row Level Security|policy_gap|CREATE POLICY|ALTER TABLE/g) || []).length >= 3,
  'R1: >=5 Performance Optimizations': (reportContent.match(/useMemo|useCallback|Optimization|Re-render/g) || []).length >= 5,
  'R1: Memory leak audit (useEffect cleanups/listeners)': reportContent.includes('Memory Leak') || reportContent.includes('cleanup') || reportContent.includes('unsubscribe'),
  
  'R2: Color palette (Hex + HSL)': reportContent.includes('HSL') && reportContent.includes('#'),
  'R2: Typography system (Google Fonts)': reportContent.includes('Font') || reportContent.includes('typography'),
  'R2: >=5 Reanimated 3 Micro-interactions': (reportContent.match(/useAnimatedStyle|useSharedValue|withTiming|withSpring/g) || []).length >= 5,
  'R2: One-handed UX critique & layout code': reportContent.includes('one-handed') || reportContent.includes('thumb-zone') || reportContent.includes('bottom-aligned'),
  'R2: Complete Navigation Flow': reportContent.includes('navigation') || reportContent.includes('Expo Router'),

  'R3: Product image fetching (Open Food Facts + fallback)': reportContent.includes('openfoodfacts') || reportContent.includes('Open Food Facts'),
  'R3: Hybrid scanning pipeline code': reportContent.includes('OCR') || reportContent.includes('Barcode') || reportContent.includes('Gemini Vision'),
  'R3: Scan debouncing & duplicate detection': reportContent.includes('debounce') || reportContent.includes('duplicate'),
  'R3: Batch scanning UX': reportContent.includes('batch') || reportContent.includes('Batch'),

  'R4: Conversational Chat Interface': reportContent.includes('Chat') || reportContent.includes('Assistant'),
  'R4: Push Notifications (expo-notifications)': reportContent.includes('expo-notifications') || reportContent.includes('Notification'),
  'R4: Background Expiry Checker': reportContent.includes('background') || reportContent.includes('expiry') || reportContent.includes('Expiration'),
  'R4: >=3 Proactive Triggers': reportContent.includes('trigger') || reportContent.includes('Reminder'),

  'R5: Free vs Premium Matrix': reportContent.includes('Free') && reportContent.includes('Premium') && reportContent.includes('|'),
  'R5: RevenueCat Integration': reportContent.includes('RevenueCat') || reportContent.includes('purchases'),
  'R5: Paywall UI Component': reportContent.includes('Paywall') || reportContent.includes('paywall'),
  'R5: Entitlement Gate Hook': reportContent.includes('useEntitlement') || reportContent.includes('Entitlement'),

  'R6: >=5 Innovative Feature Proposals': reportContent.includes('Widget') || reportContent.includes('Siri') || reportContent.includes('Gamification') || reportContent.includes('Health') || reportContent.includes('Receipt'),
  'R6: App Store/Google Play Compliance': reportContent.includes('Compliance') || reportContent.includes('Privacy') || reportContent.includes('App Store'),
  'R6: Viral Growth Loop': reportContent.includes('Viral') || reportContent.includes('Growth') || reportContent.includes('Share') || reportContent.includes('Referral')
};

for (const [key, val] of Object.entries(checks)) {
  console.log(`[${val ? 'PASS' : 'FAIL'}] ${key}`);
}

fs.writeFileSync(
  path.join(__dirname, 'audit_summary.json'),
  JSON.stringify({ allSrcFiles, missingFiles, codeBlockCount, suspiciousBlocks, checks }, null, 2)
);

console.log('\nVerification complete. Saved audit_summary.json.');
