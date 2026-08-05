const fs = require('fs');
const path = require('path');
const target_files = {
    'colors.ts': 'src/constants/colors.ts',
    'theme.ts': 'src/constants/colors.ts', // 2.1 is theme.ts but we write colors.ts
    'typography.ts': 'src/constants/typography.ts',
    'SwipeableInventoryCard.tsx': 'src/components/SwipeableInventoryCard.tsx',
    'AnimatedScreenWrapper.tsx': 'src/components/AnimatedScreenWrapper.tsx',
    'FridgePullToRefresh.tsx': 'src/components/FridgePullToRefresh.tsx',
    'ShimmerSkeleton.tsx': 'src/components/ShimmerSkeleton.tsx',
    'ScanReticleView.tsx': 'src/components/ScanReticleView.tsx',
    'Bottom Dock Action Bar': 'src/components/BottomDockActionBar.tsx',
    'productImageService.ts': 'src/services/productImageService.ts',
    'hybridScanningPipeline.ts': 'src/services/hybridScanningPipeline.ts',
    'BatchCameraScanner.tsx': 'src/components/BatchCameraScanner.tsx',
    'AIChatAssistant.tsx': 'src/components/AIChatAssistant.tsx',
    'backgroundScheduler.ts': 'src/services/backgroundScheduler.ts',
    'useEntitlements.ts': 'src/hooks/useEntitlements.ts',
    'PaywallScreen.tsx': 'src/components/PaywallScreen.tsx',
    'WidgetBridge.ts': 'src/services/WidgetBridge.ts',
    'useVoiceShortcuts.ts': 'src/hooks/useVoiceShortcuts.ts',
    'GamificationEngine.ts': 'src/services/GamificationEngine.ts',
    'HealthSyncService.ts': 'src/services/HealthSyncService.ts',
    'StoreRouteOptimizer.ts': 'src/services/StoreRouteOptimizer.ts',
    'SocialRecipeCard.tsx': 'src/components/SocialRecipeCard.tsx',
    'useViralDeepLink.ts': 'src/hooks/useViralDeepLink.ts',
    'CameraPermissionModal.tsx': 'src/components/CameraPermissionModal.tsx',
    'PaywallLegalFooter.tsx': 'src/components/PaywallLegalFooter.tsx',
    'src/components/CameraScanner.tsx': 'src/components/CameraScanner.tsx',
    'src/components/InventoryCard.tsx': 'src/components/InventoryCard.tsx',
    'src/components/SkeletonLoader.tsx': 'src/components/SkeletonLoader.tsx',
    'src/components/UrgencyFilter.tsx': 'src/components/UrgencyFilter.tsx'
};

const reportPath = path.join(__dirname, 'SMART_FRIDGE_AI_AUDIT_REPORT.md');
const content = fs.readFileSync(reportPath, 'utf8');

const written = [];
const blocks = content.split(/^(?:###|##)\s/m);

blocks.forEach(block => {
    const lines = block.split('\n');
    const header = lines[0];
    
    for (const [key, outPathFragment] of Object.entries(target_files)) {
        if (header.includes(key)) {
            const codeMatch = block.match(/```[a-z]*\n([\s\S]*?)```/);
            if (codeMatch) {
                const codeContent = codeMatch[1].trim();
                const outPath = path.join(__dirname, outPathFragment.replace(/\//g, '\\'));
                fs.mkdirSync(path.dirname(outPath), { recursive: true });
                fs.writeFileSync(outPath, codeContent + '\n', 'utf8');
                written.push(outPathFragment);
                // Remove it so we don't write it multiple times if there are duplicate matches
                delete target_files[key];
                break;
            }
        }
    }
});

console.log(JSON.stringify(written));
