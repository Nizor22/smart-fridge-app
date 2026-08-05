const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const reportPath = path.join(__dirname, '..', '..', 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

console.log(`Report total lines: ${reportContent.split('\n').length}`);
console.log(`Report total size: ${reportContent.length} bytes`);

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
    length: code.length,
    lines: code.split('\n').length
  });
}

console.log(`Extracted ${blocks.length} code blocks.`);

const langMap = {};
blocks.forEach(b => {
  langMap[b.lang] = (langMap[b.lang] || 0) + 1;
});
console.log('Language breakdown:', langMap);

const tsErrors = [];
const dummyPlaceholders = [];
const suspiciousPatterns = [];

const dummyPatterns = [
  /\/\/\s*\.\.\.\s*todo/i,
  /\/\/\s*\.\.\.\s*rest/i,
  /\/\/\s*implement\s+here/i,
  /\/\/\s*your\s+code\s+here/i,
  /\/\/\s*\.\.\.\s*existing/i,
  /\/\/\s*\[\s*insert/i,
  /\/\/\s*\.\.\.\s*$/m,
  /\/\*\s*\.\.\.\s*\*\//,
  /TODO:/i,
  /FIXME:/i,
  /placeholder/i
];

blocks.forEach(b => {
  dummyPatterns.forEach(pattern => {
    if (pattern.test(b.code)) {
      const matchingLine = b.code.split('\n').find(line => pattern.test(line));
      // Check if it's a false positive (e.g., text commentary or string literal)
      dummyPlaceholders.push({
        blockIndex: b.index,
        lineNumber: b.lineNumber,
        lang: b.lang,
        pattern: pattern.toString(),
        sample: matchingLine ? matchingLine.trim() : ''
      });
    }
  });

  const checkLang = b.lang === 'typescript' ? 'ts' : b.lang;
  if (['ts', 'tsx', 'js', 'jsx'].includes(checkLang)) {
    const isJsx = checkLang === 'tsx' || checkLang === 'jsx';
    const sourceFile = ts.createSourceFile(
      `block_${b.index}.${checkLang}`,
      b.code,
      ts.ScriptTarget.Latest,
      true,
      isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const syntaxErrors = sourceFile.parseDiagnostics || [];
    if (syntaxErrors.length > 0) {
      syntaxErrors.forEach(diag => {
        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        const pos = sourceFile.getLineAndCharacterOfPosition(diag.start || 0);
        tsErrors.push({
          blockIndex: b.index,
          lineNumber: b.lineNumber + pos.line,
          lang: b.lang,
          message
        });
      });
    }
  }

  if (b.lang === 'json') {
    try {
      JSON.parse(b.code);
    } catch (err) {
      tsErrors.push({
        blockIndex: b.index,
        lineNumber: b.lineNumber,
        lang: b.lang,
        message: `JSON parse error: ${err.message}`
      });
    }
  }
});

console.log(`\n--- DUMMY PLACEHOLDERS / SUSPICIOUS PATTERNS (${dummyPlaceholders.length}) ---`);
console.log(JSON.stringify(dummyPlaceholders, null, 2));

console.log(`\n--- SYNTAX ERRORS FOUND (${tsErrors.length}) ---`);
console.log(JSON.stringify(tsErrors, null, 2));

// Test target items specifically
console.log('\n--- CHECKING TARGET ITEMS ---');

const checkItem = (name, regex) => {
  const found = regex.test(reportContent);
  console.log(`- ${name}: ${found ? 'PASS' : 'FAIL'}`);
  return found;
};

checkItem('CameraPermissionModal.tsx component', /src\/components\/CameraPermissionModal\.tsx/);
checkItem('PaywallLegalFooter.tsx component', /src\/components\/PaywallLegalFooter\.tsx/);
checkItem('Privacy Policy snippet', /PRIVACY POLICY FOR SMART FRIDGE AI/);
checkItem('SocialRecipeCard.tsx component', /src\/components\/SocialRecipeCard\.tsx/);
checkItem('package.json diff', /package\.json/);
checkItem('non-mutating [...items].sort', /\[\.\.\.items\]\.sort/);

