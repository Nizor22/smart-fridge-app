const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

const section1Index = reportContent.indexOf('# SECTION 1');
const section2Index = reportContent.indexOf('# SECTION 2');
const section1Content = reportContent.substring(section1Index, section2Index);

const fileSubsections = section1Content.split(/### \d+\.\s+`([^`]+)`/g);

for (let i = 1; i < fileSubsections.length; i += 2) {
  const filePath = fileSubsections[i];
  const fileText = fileSubsections[i + 1];
  
  console.log(`\n========================================`);
  console.log(`FILE #${(i+1)/2}: ${filePath}`);
  console.log(`========================================`);
  console.log(fileText.trim().substring(0, 400));
}
