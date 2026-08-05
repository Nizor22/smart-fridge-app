const fs = require('fs');
const path = require('path');
const reportPath = path.join(__dirname, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const content = fs.readFileSync(reportPath, 'utf8');

// For BottomDockActionBar, it's under 2.4
const dockMatch = content.match(/## 2\.4 One-Handed Mobile UX Critique & Code[\s\S]*?```tsx\n([\s\S]*?)```/);
if (dockMatch) {
    const outPath = path.join(__dirname, 'src/components/BottomDockActionBar.tsx');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, dockMatch[1].trim() + '\n', 'utf8');
    console.log("Wrote BottomDockActionBar.tsx");
}

// For PaywallScreen, it's under 5.2, the second code block, or look for "// src/components/PaywallScreen.tsx"
const paywallMatch = content.match(/\/\/ src\/components\/PaywallScreen\.tsx\n([\s\S]*?)```/);
if (paywallMatch) {
    const outPath = path.join(__dirname, 'src/components/PaywallScreen.tsx');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    // the match doesn't include the first line comment so let's just write what we captured, but maybe re-add imports if they were before it.
    // Wait, the regex `\/\/ src\/components\/PaywallScreen\.tsx\n([\s\S]*?)``` ` might miss if it starts right after ```tsx. Let's make it more robust.
}

// More robust for PaywallScreen
const paywallRegex = /```tsx\n\/\/ src\/components\/PaywallScreen\.tsx\n([\s\S]*?)```/;
const paywallMatch2 = content.match(paywallRegex);
if (paywallMatch2) {
    const outPath = path.join(__dirname, 'src/components/PaywallScreen.tsx');
    fs.writeFileSync(outPath, "// src/components/PaywallScreen.tsx\n" + paywallMatch2[1].trim() + '\n', 'utf8');
    console.log("Wrote PaywallScreen.tsx");
} else {
    // try fallback
    const match3 = content.match(/```tsx\n(?:.*?\n)*?export default function PaywallScreen([\s\S]*?)```/);
    if(match3) {
        console.log("found PaywallScreen via fallback");
    }
}
