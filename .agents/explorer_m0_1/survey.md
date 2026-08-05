# Smart Fridge AI — Milestone 0 Codebase Audit & File Inventory Survey

**Date**: 2026-08-04  
**Auditor**: Explorer Agent (`explorer_m0_1`)  
**Target Repository**: `C:\Users\16468\.gemini\antigravity\scratch\smart-fridge app`  
**Audit Scope**: Full inventory of all source files (`src/`), Expo Router configuration, navigation hierarchy, external APIs, state hooks, and asset dependencies.

---

## 1. Executive Summary & Architecture Overview

The **Smart Fridge AI** mobile application is built with **Expo SDK 54**, **React Native 0.81.5**, **TypeScript**, and **NativeWind (TailwindCSS)**. It uses **Expo Router v6** for file-based navigation, **Supabase** for backend database, authentication, row-level security (RLS), and real-time sync, **Google Gemini 3.5 Flash REST API (v1beta)** for multi-modal food scanner and AI recipe generation, **Open Food Facts API** for barcode lookups, and **AsyncStorage** for offline caching.

### Key Architecture Components:
- **Routing**: Expo Router (`src/app/`) with root layout `_layout.tsx` wrapping the application in `FridgeProvider`, rendering a `(tabs)` navigator with 4 main tab screens (`index`, `list`, `recipes`, `settings`).
- **State Management**: React Context (`FridgeContext.tsx`) for global active fridge state and membership management, paired with specialized custom hooks (`useAuth`, `useInventory`, `useGroceryList`, `useFridges`).
- **Scanning Pipeline**: Dual-mode camera scanner (`CameraScanner.tsx`) utilizing `expo-camera` (Photo Vision AI via Gemini vs Barcode Lookup via Open Food Facts API) with `expo-image-manipulator` downscaling to 1024px JPEG.
- **Expiration Engine**: Dynamic shelf-life calculator (`expiration.ts`) and `expo-notifications` scheduler (`notifications.ts`) targeting items expiring within 48h and 3-5 days.

---

## 2. Comprehensive File-by-File Source Inventory (`src/`)

Below is the complete file-by-file detail of all **37 source files** under `src/`.

### Summary Statistics Table

| Path | Lines | Default Export | Key Named / Type Exports | State Hooks Used | External APIs / Libraries Called | Component / Module Purpose |
|---|---|---|---|---|---|---|
| `src/app/_layout.tsx` | 14 | `RootLayout` | None | None | Expo Router (`Stack`) | Root layout wrapping app in `FridgeProvider` and Stack navigator |
| `src/app/(tabs)/_layout.tsx` | 84 | `TabLayout` | `AnimatedIcon` (internal) | `useSharedValue`, `useAnimatedStyle`, `useEffect` | Expo Router (`Tabs`), Vector Icons, Reanimated | Tab bar layout defining 4 tabs with animated icons and emerald theme |
| `src/app/(tabs)/index.tsx` | 215 | `DashboardScreen` | None | `useState`, `useCallback`, `useFocusEffect`, Reanimated hooks | Supabase (via hooks), Vector Icons, Reanimated, Expo Router | Main dashboard screen with stats, urgent filter, list, scanner modal |
| `src/app/(tabs)/list.tsx` | 131 | `GroceryListScreen` | None | `useState`, `useCallback`, `useFocusEffect` | Supabase Realtime & DB (via hooks), Vector Icons, Reanimated | Grocery list screen with To Buy / Purchased tabs, inline input, fridge filter |
| `src/app/(tabs)/recipes.tsx` | 183 | `RecipesScreen` | `Recipe` (interface) | `useState` | Supabase DB, Gemini REST API (`generateRecipe`), Vector Icons | AI Chef screen querying inventory & calling Gemini 3.5 Flash for recipe |
| `src/app/(tabs)/settings.tsx` | 731 | `SettingsScreen` | `InputField`, `SettingsGroup` | `useState`, `useEffect`, `useRef` | Supabase Auth/DB, Expo Notifications, Linking, Share | Account, Auth (login/signup/reset OTP), profile, support & multi-fridge management |
| `src/components/CameraScanner.tsx` | 612 | `CameraScanner` | `Props`, `Mode`, `ScanState` | `useState`, `useRef`, `useEffect`, Reanimated hooks | Expo Camera, Expo Haptics, ImageManipulator, Gemini API, Open Food Facts | Dual-mode scanning camera (Photo AI Vision vs Barcode lookup) |
| `src/components/InventoryCard.tsx` | 183 | `InventoryCard` | `InventoryItem` (type) | `useState` | Expo Haptics, Reanimated | Inventory item card with urgency badge, long-press menu, expiry modal |
| `src/components/SkeletonLoader.tsx` | 115 | `SkeletonLoader` | `SkeletonLoaderProps` | `useSharedValue`, `useAnimatedStyle`, `useEffect` | Reanimated | Shimmer loading skeleton component for cards & stats |
| `src/components/UrgencyFilter.tsx` | 68 | `UrgencyFilter` | `FilterPill` | `useAnimatedStyle` | Reanimated | Horizontal filter bar for urgency status and food categories |
| `src/components/animated-icon.tsx` | 149 | None | `AnimatedSplashOverlay`, `AnimatedIcon` | `useState` | Expo Image, Expo Splash Screen, Reanimated Keyframes | Native splash screen overlay and animated icon component |
| `src/components/animated-icon.web.tsx` | 109 | None | `AnimatedSplashOverlay`, `AnimatedIcon` | Reanimated Keyframes | Expo Image, Reanimated | Web version of animated splash icon with CSS module fallback |
| `src/components/app-tabs.tsx` | 33 | `AppTabs` | None | `useColorScheme` | `expo-router/unstable-native-tabs` | Native iOS/Android tab bar component |
| `src/components/app-tabs.web.tsx` | 116 | `AppTabs` | `TabButton`, `CustomTabList` | `useColorScheme` | `expo-router/ui`, `expo-symbols` | Web tab bar header navigation layout |
| `src/components/external-link.tsx` | 26 | None | `ExternalLink` | None | `expo-router` (`Link`), `expo-web-browser` | Link component opening external URLs in in-app browser |
| `src/components/hint-row.tsx` | 36 | None | `HintRow` | None | None | Helper UI row for display of code hints |
| `src/components/themed-text.tsx` | 74 | None | `ThemedText`, `ThemedTextProps` | Custom `useTheme` | React Native `Text`, `Platform` | Theme-aware Text component with typography styles |
| `src/components/themed-view.tsx` | 17 | None | `ThemedView`, `ThemedViewProps` | Custom `useTheme` | React Native `View` | Theme-aware View component supporting light/dark background colors |
| `src/components/ui/collapsible.tsx` | 66 | None | `Collapsible` | `useState`, `useTheme` | `expo-symbols`, Reanimated | Collapsible accordion card component with animated chevron |
| `src/components/web-badge.tsx` | 44 | None | `WebBadge` | `useColorScheme` | Expo Image | Displays current Expo SDK version and badge graphic |
| `src/components/animated-icon.module.css` | 7 | None | None | N/A | CSS Module | Web styling for logo background gradient |
| `src/constants/theme.ts` | 66 | None | `Colors`, `ThemeColor`, `Fonts`, `Spacing`, etc. | N/A | React Native `Platform` | Color palettes (light/dark), typography, spacing constants |
| `src/context/FridgeContext.tsx` | 183 | None | `FridgeProvider`, `useFridgeContext`, `Fridge` | `useState`, `useEffect`, `useCallback`, `useRef` | Supabase DB & RPC (`join_fridge_by_code`) | React Context managing active fridge and multi-fridge CRUD |
| `src/global.css` | 18 | None | None | N/A | TailwindCSS / NativeWind | Base Tailwind layers and CSS custom HSL variables |
| `src/hooks/use-color-scheme.ts` | 2 | None | `useColorScheme` | N/A | React Native `useColorScheme` | Re-exports native `useColorScheme` hook |
| `src/hooks/use-color-scheme.web.ts` | 22 | None | `useColorScheme` | `useState`, `useEffect` | React Native `useColorScheme` | Web-compatible `useColorScheme` hook handling SSR hydration |
| `src/hooks/use-theme.ts` | 15 | None | `useTheme` | Custom `useColorScheme` | Theme constants | Hook returning active light/dark color palette object |
| `src/hooks/useAuth.ts` | 51 | None | `useAuth` | `useState`, `useEffect` | Supabase Auth & DB (`profiles`) | Manages user session state, authentication listener, user profile name |
| `src/hooks/useFridges.ts` | 153 | None | `useFridges`, `Fridge` | `useState`, `useEffect`, `useCallback`, `useRef` | Supabase DB & RPC (`join_fridge_by_code`) | Standalone hook for multi-fridge management and switching |
| `src/hooks/useGroceryList.ts` | 80 | None | `useGroceryList`, `GroceryItem` | `useState`, `useEffect`, `useCallback` | Supabase DB, Supabase Realtime, AsyncStorage | Grocery list management with realtime sync & offline cache |
| `src/hooks/useInventory.ts` | 113 | None | `useInventory` | `useState`, `useEffect`, `useCallback` | Supabase DB, Supabase Realtime, AsyncStorage, Notifications | Inventory items CRUD, expiration enrichment, soft deletion (`TRASHED`/`CONSUMED`) |
| `src/lib/ai.ts` | 158 | None | `getImageForCategory`, `analyzeFridgeImage`, `generateRecipe` | N/A | Google Gemini REST API (`generativelanguage.googleapis.com`) | AI integration service: vision scanner, recipe generation, model fallback chain |
| `src/lib/barcode.ts` | 55 | None | `lookupBarcode`, `BarcodeProduct` | N/A | Open Food Facts REST API | Barcode API lookup service and category mapping |
| `src/lib/cache.ts` | 39 | None | `cacheInventory`, `getCachedInventory`, `cacheGroceryList`, etc. | N/A | AsyncStorage | Local storage persistence for inventory and grocery items |
| `src/lib/expiration.ts` | 39 | None | `getShelfLifeDays`, `calculateExpiryDate`, `getDaysRemaining`, `calculateUrgency`, etc. | N/A | Date API | Expiration and urgency calculation engine |
| `src/lib/notifications.ts` | 72 | None | `requestNotificationPermissions`, `scheduleExpirationAlerts` | N/A | Expo Notifications | Local push notification scheduler for expiring items |
| `src/lib/supabase.ts` | 23 | None | `supabase`, `getCurrentUserId` | N/A | Supabase JS SDK, AsyncStorage | Initializes Supabase client with persistent storage |

---

## 3. Detailed File Analysis

### 3.1 Routing & Screens (`src/app/`)

#### `src/app/_layout.tsx` (14 lines)
- **Exports**: `RootLayout` (default)
- **Hooks**: None
- **Dependencies**: `expo-router`, `FridgeProvider`, `global.css`
- **Structure**: Wraps application in `FridgeProvider`. Renders Expo Router `<Stack>` with `<Stack.Screen name="(tabs)" options={{ headerShown: false }} />`.

#### `src/app/(tabs)/_layout.tsx` (84 lines)
- **Exports**: `TabLayout` (default), `AnimatedIcon` (internal component)
- **State Hooks**: `useSharedValue(1)` (Reanimated scale), `useAnimatedStyle`
- **Side Effects**: `useEffect` animating tab icon scale `withSpring(focused ? 1.2 : 1)`.
- **Navigation Structure**: Renders `<Tabs>` container with 4 tab screens:
  1. `index` -> Title: "Fridge", Icon: `fridge-outline`
  2. `list` -> Title: "Shopping", Icon: `cart-outline`
  3. `recipes` -> Title: "Recipes", Icon: `chef-hat`
  4. `settings` -> Title: "Settings", Icon: `cog-outline`
- **Styling**: `tabBarStyle`: Background `rgba(15, 23, 42, 0.95)`, active tint `#059669` (emerald), absolute position, height 70.

#### `src/app/(tabs)/index.tsx` (215 lines)
- **Exports**: `DashboardScreen` (default)
- **State Hooks**:
  - `isScannerVisible` (`useState(false)`)
  - `activeFilter` (`useState('All')`)
  - `refreshing` (`useState(false)`)
  - `fridgePickerVisible` (`useState(false)`)
  - `pulseValue` (`useSharedValue(1)`), `pulseStyle` (`useAnimatedStyle`)
  - `useFocusEffect` (re-triggers `fetchItems()`)
- **Custom Hooks**: `useAuth()`, `useFridgeContext()`, `useInventory(userId, activeFridgeId)`, `useRouter()`
- **External APIs**: Supabase DB (via `useInventory`), `@expo/vector-icons`, Reanimated (`FadeInDown`, `withRepeat`, `withTiming`)
- **UI Structure**:
  - `SafeAreaView` with dark background `#0f172a`.
  - `FlatList` displaying `filteredData` with header displaying: greeting, active user name, fridge switcher pill button, unauthenticated alert banner, offline notice banner, 3 key summary stat cards (Total items, Expiring soon count, Money saved sum), and `UrgencyFilter`.
  - Floating Action Button (FAB) camera scanner trigger with spring pulse animation.
  - Modals: `CameraScanner` modal & `Select Fridge` modal overlay.

#### `src/app/(tabs)/list.tsx` (131 lines)
- **Exports**: `GroceryListScreen` (default)
- **State Hooks**:
  - `filter` (`useState<'to_buy' | 'purchased'>('to_buy')`)
  - `newItemName` (`useState('')`)
  - `refreshing` (`useState(false)`)
  - `useFocusEffect` (re-triggers `fetchList()`)
- **Custom Hooks**: `useAuth()`, `useFridgeContext()`, `useGroceryList(userId, activeFridgeId)`
- **External APIs**: Supabase DB & Realtime (via `useGroceryList`), Vector Icons, Reanimated (`FadeInDown`, `FadeOut`)
- **UI Structure**:
  - `SafeAreaView` & `KeyboardAvoidingView`.
  - Header with item count badge, offline indicator, active fridge selector popup button.
  - Segmented toggle tab bar ('To Buy' vs 'Purchased').
  - `FlatList` displaying grocery item cards with checkbox toggle, item name, quantity badge, delete icon.
  - Floating bottom input bar with TextInput and Plus button.

#### `src/app/(tabs)/recipes.tsx` (183 lines)
- **Exports**: `RecipesScreen` (default), `Recipe` (interface)
- **State Hooks**: `loading` (`useState(false)`), `recipe` (`useState<Recipe | null>(null)`)
- **Custom Hooks**: `useAuth()`, `useFridgeContext()`
- **External APIs**: Supabase DB (`supabase.from('inventory').select('name, quantity, unit')`), Google Gemini REST API (`generateRecipe` in `lib/ai`)
- **UI Structure**:
  - `SafeAreaView` & `ScrollView`.
  - Empty state with AI Chef icon header and call to action.
  - Loading state with `ActivityIndicator` ("Cooking up something special...").
  - Generated Recipe Card displaying: Title, 1-sentence description, cook time badge, servings badge, bulleted ingredients list, numbered step-by-step instructions list.
  - "Generate Recipe" floating button styled with emerald theme and magic staff icon.

#### `src/app/(tabs)/settings.tsx` (731 lines)
- **Exports**: `SettingsScreen` (default), `InputField`, `SettingsGroup`
- **State Hooks**:
  - Session & auth modal visibility states (`authModalVisible`, `profileModalVisible`, `passwordModalVisible`, `supportModalVisible`, `helpModalVisible`, `resetModalVisible`, `resetCodeModalVisible`, `fridgeModalVisible`).
  - Auth form states (`isLogin`, `email`, `password`, `firstName`, `lastName`, `phone`, `termsAccepted`, `marketingOptIn`, `loading`).
  - Reset password state (`resetEmail`, `resetToken`, `newPassword`, `resetTimer`).
  - Edit profile state (`editFirstName`, `editLastName`, `editPhone`).
  - Preference toggles (`notificationsEnabled`, `darkModeEnabled`).
  - `timerRef` (`useRef` for OTP countdown timer).
- **Custom Hooks**: `useAuth()`, `useFridgeContext()`
- **External APIs**: Supabase Auth & DB, `expo-notifications`, `Linking`, `Share`
- **UI Structure**:
  - Profile header with user initial avatar or Sign In / Sign Up button.
  - Grouped setting cards (`ACCOUNT`, `MY FRIDGES`, `PREFERENCES`, `SUPPORT`, `ABOUT`).
  - Interactive Modals:
    1. Auth PageSheet Modal (Tabbed Login / Register with TOS & Marketing check boxes).
    2. Reset Password Email Input Modal.
    3. Reset Password 5-Minute OTP Verification Modal with live countdown badge.
    4. Edit Profile Modal.
    5. Change Password Modal.
    6. Contact Support Modal.
    7. Help Center FAQ Modal.
    8. Shared Fridge Detail Modal (View members, copy/share 6-character invite code, rename fridge, delete/leave fridge).

---

### 3.2 Components (`src/components/`)

#### `src/components/CameraScanner.tsx` (612 lines)
- **Exports**: `CameraScanner` (default), `Props`, `Mode`, `ScanState`
- **State Hooks**: `mode` (`'Photo' | 'Barcode'`), `flash` (`boolean`), `scanState` (`'idle' | 'processing' | 'preview' | 'notFound'`), `scannedProduct`, `quantity`, `scanLineY`, `pulseScale`, `cameraRef`, `scanLock`, `isMounted`.
- **External APIs**: `expo-camera` (`CameraView`, `useCameraPermissions`), `expo-haptics`, `expo-image-manipulator`, Gemini Vision API (`analyzeFridgeImage`), Open Food Facts API (`lookupBarcode`), Expiration Engine (`calculateExpiryDate`).
- **UI & Logic**:
  - Full-screen `CameraView` with back camera and torch control.
  - Top Bar: Close button, Photo/Barcode pill mode switcher, Flash toggle.
  - Fridge selector pill overlay showing currently targeted fridge.
  - Center bracket reticle frame with animated green laser scanning line in Barcode mode and pulsing scale in Photo mode.
  - Processing overlay indicator during AI Vision inference.
  - Preview card for scanned barcode items displaying product image, title, brand, mapped category, quantity step counter (- / +), "Scan Next", and "Add to Fridge" buttons.

#### `src/components/InventoryCard.tsx` (183 lines)
- **Exports**: `InventoryCard` (default), `InventoryItem` (type)
- **State Hooks**: `expiryModalVisible` (`useState(false)`), `daysInput` (`useState('')`)
- **External APIs**: `expo-haptics`, Reanimated (`FadeInDown`)
- **UI & Logic**:
  - Inventory item card rendering product photo or category fallback icon.
  - Displays product title, category name, quantity, price, and urgency pill badge (`EXPIRED` - `#ef4444`, `EXPIRING_SOON` - `#f59e0b`, `FRESH` - `#10b981`).
  - Cross-platform long-press action menu (`Alert.alert`) offering quick actions: Mark Consumed (`Used It`), Set Expiry (`Set Expiry`), and Delete (`Trash`).
  - Modal overlay for manually adjusting item expiration days with quick preset buttons (`1d`, `3d`, `7d`, `14d`, `30d`).

#### `src/components/SkeletonLoader.tsx` (115 lines)
- **Exports**: `SkeletonLoader` (default)
- **State Hooks**: `translateX` (`useSharedValue`), `useAnimatedStyle`, `useEffect`
- **Logic**: Continuous linear shimmer animation translating a `#334155` highlight block across `#1e293b` skeleton placeholders. Supports `'card'` list view or `'stat'` row view.

#### `src/components/UrgencyFilter.tsx` (68 lines)
- **Exports**: `UrgencyFilter` (default), `FilterPill` (internal)
- **State Hooks**: Reanimated `useAnimatedStyle`, `withTiming`
- **Logic**: Horizontal scroll view with filter pills: `All Items`, `🔴 Expired`, `🟡 Expiring`, `🟢 Fresh`, `Dairy`, `Produce`, `Meat`. Smoothly interpolates background and text color on tap.

#### Additional Component Files:
- `src/components/animated-icon.tsx` (149 lines): Native splash screen overlay and keyframe logo animation using Expo Splash Screen and Reanimated.
- `src/components/animated-icon.web.tsx` (109 lines): Web fallback for animated icon using CSS module.
- `src/components/app-tabs.tsx` (33 lines): Expo Router native tab trigger wrapper for iOS/Android.
- `src/components/app-tabs.web.tsx` (116 lines): Expo Router web tab trigger layout.
- `src/components/external-link.tsx` (26 lines): Native in-app browser link handler using `expo-web-browser`.
- `src/components/hint-row.tsx` (36 lines): Starter code display snippet row.
- `src/components/themed-text.tsx` (74 lines): Theme-aware text component supporting 8 style variants.
- `src/components/themed-view.tsx` (17 lines): Theme-aware view container component.
- `src/components/ui/collapsible.tsx` (66 lines): Accordion expander card component.
- `src/components/web-badge.tsx` (44 lines): Displays active Expo SDK version badge.
- `src/components/animated-icon.module.css` (7 lines): CSS gradient class definitions for web logo.

---

### 3.3 Context, Hooks & Utilities (`src/context/`, `src/hooks/`, `src/lib/`)

#### `src/context/FridgeContext.tsx` (183 lines)
- **Exports**: `FridgeProvider`, `useFridgeContext`, `Fridge` (interface)
- **State Hooks**: `fridges` (`useState`), `activeFridgeId` (`useState`), `loading` (`useState`), `activeFridgeRef` (`useRef`), `useAuth`
- **External APIs**: Supabase DB (`fridge_members`, `fridges`, `profiles`, RPC `join_fridge_by_code`)
- **Key Methods**:
  - `fetchFridges()`: Queries user's fridge memberships, joins with `fridges` table, enriches with role (`owner` / `member`), auto-selects active fridge.
  - `createFridge(name)`: Inserts new fridge and owner membership record into Supabase.
  - `joinFridge(inviteCode)`: Calls Supabase stored procedure RPC `join_fridge_by_code`.
  - `leaveFridge(fridgeId)`: Removes user membership from shared fridge.
  - `deleteFridge(fridgeId)`: Deletes fridge record (cascading items).
  - `renameFridge(fridgeId, name)`: Updates fridge title.
  - `getMembers(fridgeId)`: Resolves list of members with profiles.

#### `src/hooks/useAuth.ts` (51 lines)
- **Exports**: `useAuth`
- **State Hooks**: `session` (`useState`), `loading` (`useState`), `profileName` (`useState`)
- **External APIs**: Supabase Auth (`getSession`, `onAuthStateChange`), Supabase DB (`profiles`)
- **Returns**: `{ session, userId, userEmail, userName, isAuthenticated, loading, refreshProfile }`.

#### `src/hooks/useFridges.ts` (153 lines)
- **Exports**: `useFridges`, `Fridge` (interface)
- **Logic**: Standalone hook mirror of multi-fridge management logic.

#### `src/hooks/useGroceryList.ts` (80 lines)
- **Exports**: `useGroceryList`, `GroceryItem` (interface)
- **State Hooks**: `items` (`useState`), `loading` (`useState`), `isOffline` (`useState`)
- **External APIs**: Supabase DB (`grocery_list`), Supabase Realtime channel (`grocery:${fridgeId}`), AsyncStorage (`cacheGroceryList`, `getCachedGroceryList`).
- **Key Features**: Optimistic UI item additions, toggle item purchase status, delete item, offline storage fallback, multi-device realtime WebSocket synchronization.

#### `src/hooks/useInventory.ts` (113 lines)
- **Exports**: `useInventory`
- **State Hooks**: `items` (`useState`), `loading` (`useState`), `isOffline` (`useState`)
- **External APIs**: Supabase DB (`inventory`), Supabase Realtime channel (`inventory:${fridgeId}`), AsyncStorage (`cacheInventory`), Expo Notifications (`scheduleExpirationAlerts`), Expiration Engine (`getUrgencyFromItem`).
- **Key Features**: Soft deletion mechanism (`status: 'TRASHED'` / `status: 'CONSUMED'` to preserve historical data for AI training), expiration enrichment, realtime multi-user updates, optimistic state updates.

#### `src/lib/ai.ts` (158 lines)
- **Exports**: `getImageForCategory`, `analyzeFridgeImage`, `generateRecipe`
- **External APIs**: Google Gemini REST API (`https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`)
- **Model Fallback Chain**: `['gemini-3.5-flash', 'gemini-3.5-flash-lite']` (Retired 2.x models replaced).
- **Features**: Exponential retry handler for 429/503 HTTP codes, JSON payload parsing, category Unsplash photo fallback mapping.

#### `src/lib/barcode.ts` (55 lines)
- **Exports**: `lookupBarcode`, `BarcodeProduct` (interface)
- **External APIs**: Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/${code}.json`)
- **Tag Mapping**: Converts Open Food Facts category tags (`dairies`, `meats`, `fruits`, `beverages`, `cereals`, etc.) into internal app categories (`Dairy`, `Meat`, `Produce`, `Beverage`, `Pantry`, `Other`).

#### `src/lib/cache.ts` (39 lines)
- **Exports**: `cacheInventory`, `getCachedInventory`, `cacheGroceryList`, `getCachedGroceryList`, `clearCache`
- **External APIs**: `@react-native-async-storage/async-storage`
- **Keys**: `cache_inventory`, `cache_grocery_list`.

#### `src/lib/expiration.ts` (39 lines)
- **Exports**: `getShelfLifeDays`, `calculateExpiryDate`, `getDaysRemaining`, `calculateUrgency`, `getUrgencyFromItem`, `UrgencyLevel` (type)
- **Shelf-Life Matrix**: `Dairy`: 7 days, `Meat`: 3 days, `Produce`: 5 days, `Pantry`: 90 days, `Beverage`: 30 days, `Other`: 14 days.
- **Thresholds**: <= 2 days (`EXPIRED`), <= 5 days (`EXPIRING_SOON`), > 5 days (`FRESH`).

#### `src/lib/notifications.ts` (72 lines)
- **Exports**: `requestNotificationPermissions`, `scheduleExpirationAlerts`
- **External APIs**: `expo-notifications`
- **Scheduling Logic**: Cancels existing alerts, schedules immediate push for items expiring within 48h and 9:00 AM morning push for items expiring in 3-5 days.

#### `src/lib/supabase.ts` (23 lines)
- **Exports**: `supabase`, `getCurrentUserId`
- **External APIs**: `@supabase/supabase-js`, `react-native-url-polyfill`, `AsyncStorage`
- **Configuration**: Configures client with `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`.

---

## 4. Navigation Hierarchy & Router Configurations

The project uses **Expo Router v6** (`expo-router/entry`) with file-based routing centered in `src/app/`.

```
src/app/
├── _layout.tsx               # Root Stack Navigator (wraps in FridgeProvider)
└── (tabs)/                   # Tab Group (headerShown: false, absolute tab bar)
    ├── _layout.tsx           # Tab Bar Layout (Fridge, Shopping, Recipes, Settings)
    ├── index.tsx             # Tab 1: Fridge Dashboard & Inventory List
    ├── list.tsx              # Tab 2: Shared Grocery List
    ├── recipes.tsx           # Tab 3: AI Recipe Generator
    └── settings.tsx          # Tab 4: Account, Auth, Multi-Fridge & App Settings
```

---

## 5. Asset Inventory & Asset Usage

All asset files are located under `./assets/`:

- `assets/images/icon.png` — Main application icon (used in app.json and expo-notifications).
- `assets/images/splash-icon.png` — Splash screen graphic (76px width, `#0f172a` background).
- `assets/images/android-icon-foreground.png` — Android adaptive icon foreground.
- `assets/images/android-icon-background.png` — Android adaptive icon background (`#0f172a`).
- `assets/images/android-icon-monochrome.png` — Android monochrome icon.
- `assets/images/favicon.png` — Web browser tab icon.
- `assets/images/logo-glow.png` — Glow background asset used in `animated-icon.tsx`.
- `assets/images/expo-logo.png` — Expo logo image used in `animated-icon.tsx`.
- `assets/images/expo-badge.png` & `expo-badge-white.png` — Expo badge graphics used in `web-badge.tsx`.
- `assets/images/tabIcons/home.png` & `explore.png` — Native tab bar icons.
- `assets/expo.icon/` — iOS SF Symbol assets wrapper.

---

## 6. Environment Configuration & External API Dependencies

From `.env`:
- `EXPO_PUBLIC_GEMINI_API_KEY`: API key for Google Gemini 3.5 Flash REST endpoint.
- `EXPO_PUBLIC_SUPABASE_URL`: `https://lljudjuoawzigandmtal.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase client anon public key.

### External APIs & Endpoints:
1. **Supabase Cloud**: REST / Realtime WebSocket API (`/rest/v1`, `/realtime/v1`). Tables: `profiles`, `fridges`, `fridge_members`, `inventory`, `grocery_list`. RPC: `join_fridge_by_code`.
2. **Google Gemini REST API**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent` and `gemini-3.5-flash-lite`.
3. **Open Food Facts API**: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`.
4. **Unsplash Image CDN**: Category fallback photos (`images.unsplash.com`).

---

## 7. Initial Findings & Code Audit Observations (For Phase 1 - Phase 6)

1. **Duplicate State Hook / Logic (Minor Redundancy)**:
   - `useFridges.ts` and `FridgeContext.tsx` contain identical state logic. The app relies on `FridgeContext`, leaving `useFridges` as a duplicate hook.
2. **Hardcoded Unsplash Image URLs**:
   - `CATEGORY_IMAGES` in `lib/ai.ts` relies on external static Unsplash URLs without caching or local fallback assets.
3. **Missing Error Boundaries & Network Fallback Gaps**:
   - While `useInventory` and `useGroceryList` feature AsyncStorage fallback, individual image loading failures and Gemini API quota rate-limit exceptions rely on basic alert dialogs rather than structured UI error boundaries.
4. **Supabase Schema & RLS Audit Needs**:
   - RLS policy verification for `fridge_members` and `inventory` soft-deletes (`TRASHED` / `CONSUMED`) will be required in Phase 1.
5. **Scanning Pipeline Enhancements**:
   - Camera scanner resizes images to 1024px, but lacks batch scanning mode, scan debouncing, or duplicate item collision handling.

---
*Report generated by Explorer Agent `explorer_m0_1` for Smart Fridge AI Milestone 0.*
