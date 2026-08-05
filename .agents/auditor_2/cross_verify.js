const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const masterPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const specialistDir = path.join(rootDir, '.agents');

const specialists = [
  { name: 'RN Engineer', file: path.join(specialistDir, 'rn_engineer_1', 'report.md') },
  { name: 'UI/UX Designer', file: path.join(specialistDir, 'ui_ux_designer_1', 'report.md') },
  { name: 'Security Auditor', file: path.join(specialistDir, 'security_auditor_1', 'report.md') },
  { name: 'Product Strategist', file: path.join(specialistDir, 'product_strategist_1', 'report.md') },
];

const masterContent = fs.readFileSync(masterPath, 'utf-8');

console.log('=== CROSS-VERIFICATION AUDIT ===\n');

specialists.forEach(sp => {
  if (!fs.existsSync(sp.file)) {
    console.log(`[MISSING] ${sp.name}: ${sp.file}`);
    return;
  }
  const content = fs.readFileSync(sp.file, 'utf-8');
  console.log(`Checking ${sp.name} (${content.length} bytes)...`);

  // Extract major section titles or key features from specialist report
  const headings = content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### '));
  console.log(`  - Found ${headings.length} headings.`);

  // Verify key components present in master report
  let missingCount = 0;
  headings.slice(0, 10).forEach(h => {
    const cleanHeading = h.replace(/^#+\s*/, '').trim();
    if (!masterContent.includes(cleanHeading.substring(0, 20))) {
      // Check partial match
      const words = cleanHeading.split(' ').slice(0, 3).join(' ');
      if (!masterContent.includes(words)) {
        missingCount++;
        console.log(`    ⚠️ Heading fragment not clearly found in master: "${cleanHeading}"`);
      }
    }
  });

  if (missingCount === 0) {
    console.log(`  - All checked section headings present in Master Report!`);
  }
});
