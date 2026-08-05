const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\16468\\.gemini\\antigravity\\scratch\\smart-fridge app';
const reportPath = path.join(rootDir, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

console.log('--- DEEP SECTION INSPECTOR ---');

// 1. Inspect RLS Policies (Section 1.2)
console.log('\n--- Section 1.2 RLS Check ---');
const rlsIndex = reportContent.indexOf('## 1.2 Complete PostgreSQL Database Schema');
const section2Index = reportContent.indexOf('# SECTION 2');
const rlsContent = reportContent.substring(rlsIndex, section2Index);
console.log(`Section 1.2 length: ${rlsContent.length} chars.`);
const sqlMatches = rlsContent.match(/CREATE POLICY/gi) || [];
console.log(`CREATE POLICY statements found in 1.2: ${sqlMatches.length}`);

// 2. Inspect Section 3 Scanning
console.log('\n--- Section 3 Scanning Check ---');
const section3Index = reportContent.indexOf('# SECTION 3');
const section4Index = reportContent.indexOf('# SECTION 4');
const scanningContent = reportContent.substring(section3Index, section4Index);
console.log(`Section 3 length: ${scanningContent.length} chars.`);
console.log(`Contains productImageService: ${scanningContent.includes('productImageService')}`);
console.log(`Contains hybridScanningPipeline: ${scanningContent.includes('hybridScanningPipeline')}`);
console.log(`Contains scan debouncing/duplicate detection: ${scanningContent.includes('debounce') || scanningContent.includes('duplicate') || scanningContent.includes('Debounce') || scanningContent.includes('Duplicate') || scanningContent.includes('recentScans') || scanningContent.includes('Deduplication')}`);

// 3. Inspect Section 4 Proactive AI Assistant
console.log('\n--- Section 4 Proactive AI Assistant Check ---');
const section5Index = reportContent.indexOf('# SECTION 5');
const aiContent = reportContent.substring(section4Index, section5Index);
console.log(`Section 4 length: ${aiContent.length} chars.`);
console.log(`Contains chat interface: ${aiContent.includes('AIChatAssistant') || aiContent.includes('Chat')}`);
console.log(`Contains push notification / expo-notifications: ${aiContent.includes('expo-notifications') || aiContent.includes('Notifications') || aiContent.includes('scheduleNotification')}`);
console.log(`Contains background scheduler: ${aiContent.includes('backgroundScheduler') || aiContent.includes('BackgroundFetch') || aiContent.includes('TaskManager')}`);

// 4. Inspect Section 6 Novel Features & Compliance
console.log('\n--- Section 6 Innovation & Compliance Check ---');
const section6Index = reportContent.indexOf('# SECTION 6');
const section7Index = reportContent.indexOf('# SECTION 7');
const innovationContent = reportContent.substring(section6Index, section7Index > -1 ? section7Index : reportContent.length);
console.log(`Section 6 length: ${innovationContent.length} chars.`);
console.log(`Contains Widgets: ${innovationContent.includes('Widget')}`);
console.log(`Contains Siri: ${innovationContent.includes('Siri') || innovationContent.includes('Shortcuts')}`);
console.log(`Contains Gamification: ${innovationContent.includes('Gamification')}`);
console.log(`Contains Health: ${innovationContent.includes('HealthSyncService') || innovationContent.includes('Health')}`);
console.log(`Contains Route Optimizer: ${innovationContent.includes('StoreRouteOptimizer')}`);
console.log(`Contains Viral Growth Loop: ${innovationContent.includes('SocialRecipeCard') || innovationContent.includes('useViralDeepLink')}`);
console.log(`Contains Compliance Checklist: ${innovationContent.includes('Compliance')}`);

