# Project: Smart Fridge AI Mobile Audit & Overhaul

## Architecture
- Framework: React Native (Expo SDK 54, React 19.1.0, React Native 0.81.5), TypeScript 5.9
- Navigation: Expo Router v6 (file-based tabs & stack)
- Backend & DB: Supabase (PostgreSQL 15+, Auth, RLS, Realtime)
- AI & Image API: Google Gemini 3.5 Flash REST API (v1beta), Open Food Facts API
- State & Storage: React Context (`FridgeContext`), AsyncStorage offline caching
- Styling & Anim: NativeWind v4, TailwindCSS 3.4.15, Reanimated 4.1.1, Expo Camera, Haptics

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1 Deep-Dive Code Audit | Strict file-by-file audit of all 37 files under `src/` for bugs, leaks, race conditions, missing error boundaries, loading states, useMemo/useCallback | M1 | ORIGINAL_REQUEST R1 |
| 2 | R1 Security & RLS Audit | Audit Supabase schema (`schema.sql`), RLS policies, privilege escalation, data leakage, SQL fix scripts | M1 | ORIGINAL_REQUEST R1 |
| 3 | R2 Next-Gen UI/UX Overhaul | Modern color palette (Hex+HSL), Google Fonts typography, 5 Reanimated 3 micro-interactions, bottom-aligned one-handed UX layout code, complete navigation flow | M2 | ORIGINAL_REQUEST R2 |
| 4 | R3 Product-Specific Image Fetching | Replace category fallbacks with product image fetching (Open Food Facts + fallback) | M3 | ORIGINAL_REQUEST R3 |
| 5 | R3 Hybrid Scanning Pipeline | Barcode → OFF → OCR → Gemini Vision → Manual pipeline with duplicate detection, scan debouncing, batch scanning UX, confidence scoring | M3 | ORIGINAL_REQUEST R3 |
| 6 | R4 Proactive AI Assistant Chat | Conversational chat interface component with Gemini responses aware of inventory | M4 | ORIGINAL_REQUEST R4 |
| 7 | R4 Push Notifications & Scheduler | `expo-notifications` setup, background task scheduler evaluating inventory daily with smart expiry & restock alerts | M4 | ORIGINAL_REQUEST R4 |
| 8 | R5 Monetization & Subscriptions | Free vs Premium feature matrix, RevenueCat integration blueprint & code (SDK, hooks, paywall UI component, entitlement gate hook, restore purchase flow), placement strategy | M5 | ORIGINAL_REQUEST R5 |
| 9 | R6 "Unknown Unknowns" Innovation | 5 novel features (widgets, Siri/Google shortcuts, gamification, HealthKit/Google Fit, price tracking, etc.) with code specs & viral growth loop | M6 | ORIGINAL_REQUEST R6 |
| 10 | R6 App Store / Google Play Compliance | Privacy policy, data collection disclosures, subscription guidelines risk audit & fixes | M6 | ORIGINAL_REQUEST R6 |
| 11 | Master Audit Synthesis | Synthesize all 4 specialist domains into a single production-ready master report (`SMART_FRIDGE_AI_AUDIT_REPORT.md`) | M7 | ORIGINAL_REQUEST |
| 12 | Verification Gate | Verify all acceptance criteria across Phase 1 - Phase 6 with exact copy-paste-ready code | M8 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Code, Architecture & Security Audit | R1 Code audit of 37 files + Supabase RLS security audit | Survey | IN_PROGRESS |
| 2 | UI/UX & Visual Overhaul | R2 Design system, palette, typography, micro-interactions, one-handed UX, nav flow | Survey | IN_PROGRESS |
| 3 | Image Fetching & Hybrid Scanning Pipeline | R3 Image fetching, OpenFoodFacts, fallback chain, scanning pipeline code, debouncing | Survey | IN_PROGRESS |
| 4 | Proactive AI Assistant & Background Scheduler | R4 Chat UI, Gemini context integration, push notifications, background task scheduler | Survey | IN_PROGRESS |
| 5 | Monetization & Subscriptions | R5 Free vs Premium matrix, RevenueCat setup, hooks, paywall UI, entitlement gate, metadata | Survey | IN_PROGRESS |
| 6 | Innovation & Compliance Audit | R6 5 novel feature specs & code, viral growth loop, App Store / Play Store compliance fixes | Survey | IN_PROGRESS |
| 7 | Master Audit Synthesis | Single master audit report (`SMART_FRIDGE_AI_AUDIT_REPORT.md`) combining all 4 specialist outputs | M1–M6 | PLANNED |
| 8 | Final Review & Verification Gate | Verification of all acceptance criteria & copy-paste-ready code | M7 | PLANNED |

## Code Layout
- `src/app/` — Router navigation & screens (`_layout`, `(tabs)/index`, `list`, `recipes`, `settings`)
- `src/components/` — UI components (`CameraScanner`, `InventoryCard`, `SkeletonLoader`, `UrgencyFilter`, etc.)
- `src/context/` — State context (`FridgeContext.tsx`)
- `src/hooks/` — React custom hooks (`useAuth`, `useInventory`, `useGroceryList`, `useFridges`, `useTheme`, etc.)
- `src/lib/` — Services & API utilities (`ai.ts`, `barcode.ts`, `cache.ts`, `expiration.ts`, `notifications.ts`, `supabase.ts`)
- `src/constants/` — Theme constants (`theme.ts`)
- `schema.sql` — Supabase PostgreSQL table & RLS schema
