const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

const section1Index = reportContent.indexOf('# SECTION 1');
const section2Index = reportContent.indexOf('# SECTION 2');
const section1Content = reportContent.substring(section1Index, section2Index);

console.log('--- SECTION 1 DETAILED ANALYSIS ---');
console.log(`Section 1 Total Length: ${section1Content.length} chars`);

// Extract all file subsections under 1.1
const fileSubsections = section1Content.split(/### \d+\.\s+`([^`]+)`/g);
console.log(`File subsections parsed: ${(fileSubsections.length - 1) / 2}`);

let filesAnalyzed = [];
let bugCount = 0;
let perfCount = 0;
let memLeakCount = 0;

for (let i = 1; i < fileSubsections.length; i += 2) {
  const filePath = fileSubsections[i];
  const fileText = fileSubsections[i + 1];
  
  filesAnalyzed.push(filePath);
  
  // Check line references
  const lineRefMatch = fileText.match(/Lines?\s+\d+|Line\s+\d+|L\d+/gi);
  const lineRefCount = lineRefMatch ? lineRefMatch.length : 0;
  
  // Check for bug / security vulnerability mentions
  if (fileText.includes('Bug') || fileText.includes('bug') || fileText.includes('Vulnerability') || fileText.includes('leak') || fileText.includes('Race condition') || fileText.includes('Unhandled') || fileText.includes('Stale closure')) {
    bugCount++;
  }
  
  if (fileText.includes('Optimization') || fileText.includes('useMemo') || fileText.includes('useCallback') || fileText.includes('re-render')) {
    perfCount++;
  }
  
  if (fileText.includes('Memory leak') || fileText.includes('cleanup') || fileText.includes('unsubscribe') || fileText.includes('timeout') || fileText.includes('interval')) {
    memLeakCount++;
  }
}

console.log(`Total src files in 1.1: ${filesAnalyzed.length}`);
console.log(`Files with bug/vulnerability findings: ${bugCount}`);
console.log(`Files with performance/optimization findings: ${perfCount}`);
console.log(`Files with memory leak analysis: ${memLeakCount}`);

