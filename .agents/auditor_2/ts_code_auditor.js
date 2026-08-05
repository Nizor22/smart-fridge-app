const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const masterReportPath = path.join(__dirname, '..', '..', 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const content = fs.readFileSync(masterReportPath, 'utf-8');

const codeBlockRegex = /```(ts|tsx|js|jsx|typescript)\n([\s\S]*?)```/g;
let match;
let blockIndex = 0;
let errorsFound = 0;

console.log('=== TS/TSX CODE BLOCK SYNTAX AUDITOR ===\n');

while ((match = codeBlockRegex.exec(content)) !== null) {
  blockIndex++;
  const lang = match[1];
  const code = match[2];
  const lineNo = content.substring(0, match.index).split('\n').length;

  const scriptKind = (lang === 'tsx' || lang === 'jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    `block_${blockIndex}.${lang}`,
    code,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  // Check for syntactic diagnostics (syntax errors)
  const diagnostics = sourceFile.parseDiagnostics || [];

  if (diagnostics.length > 0) {
    // Filter out errors caused by missing external module declarations (e.g. ambient module imports like react-native)
    // We care about structural syntax errors: unclosed tags, unclosed brackets, bad tokens, syntax failures.
    const syntaxErrors = diagnostics.filter(d => {
      // TS syntax errors usually have code ranges in 1000-2000
      return d.category === ts.DiagnosticCategory.Error;
    });

    if (syntaxErrors.length > 0) {
      console.log(`Block #${blockIndex} (${lang}) near Line ${lineNo} has ${syntaxErrors.length} syntax diagnostic(s):`);
      syntaxErrors.forEach(d => {
        const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        console.log(`  - Error [TS${d.code}] at char ${d.start}: ${message}`);
      });
      errorsFound += syntaxErrors.length;
    } else {
      console.log(`Block #${blockIndex} (${lang}) near Line ${lineNo}: PASS (0 syntax errors)`);
    }
  } else {
    console.log(`Block #${blockIndex} (${lang}) near Line ${lineNo}: PASS (0 syntax errors)`);
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total TS/TSX/JS code blocks tested: ${blockIndex}`);
console.log(`Total syntax errors found: ${errorsFound}`);
