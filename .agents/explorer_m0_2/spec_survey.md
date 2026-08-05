# Smart Fridge AI — Exhaustive Specification Survey

**Module**: Milestone 0 — Specification Audit & Architecture Mapping  
**Agent**: Explorer M0 2 (`explorer_m0_2`)  
**Date**: 2026-08-04  
**Project Root**: `C:\Users\16468\.gemini\antigravity\scratch\smart-fridge app`  

---

## 1. Executive Summary & Tech Stack Overview

| Aspect | Technology / Specification | Details |
|---|---|---|
| **Mobile Framework** | React Native (Expo SDK 54) | React 19.1.0, React Native 0.81.5, Expo Router 6.0.24 (file-based routing) |
| **Language & Compiler** | TypeScript 5.9.2 | Strict mode, path alias `@/*` -> `./src/*`, `@/assets/*` -> `./assets/*` |
| **Backend & Database** | Supabase (PostgreSQL 15+) | Supabase JS client v2.45.0, Row-Level Security (RLS), Realtime subscriptions, Auth |
| **AI Integration** | Google Gemini 3.5 Flash | Raw REST fetch to `v1beta` endpoint (`gemini-3.5-flash` with fallback to `gemini-3.5-flash-lite`) |
| **Styling System** | NativeWind v4 + Tailwind CSS 3.4.15 | CSS variable design tokens with HSL values defined in `tailwind.config.js` |
| **Animations** | React Native Reanimated v4.1.1 | Native thread animations, layout transitions (`FadeInDown`, `FadeOut`) |
| **Hardware & Devices** | `expo-camera` v17, `expo-image-manipulator` v14, `expo-notifications` v32, `expo-haptics` v15 | Barcode/camera scanning, image resizing (1024px JPEGs), local notifications, haptics |
| **Local Persistence** | `@react-native-async-storage/async-storage` v2.2.0 | Offline fallback caching for inventory & grocery items, Supabase auth session store |

---

## 2. Database Schema & Supabase Architecture Specifications

### 2.1 Table Definitions & Column Specifications

#### Table 1: `profiles`
User profile data automatically synchronized with Supabase Auth users.

| Column | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | Primary Key, FK `auth.users(id)` ON DELETE CASCADE | — | User identifier linked directly to Supabase Auth user |
| `first_name` | `text` / `varchar` | Nullable | `NULL` | User's first name |
| `last_name` | `text` / `varchar` | Nullable | `NULL` | User's last name |
| `phone` | `text` / `varchar` | Nullable | `NULL` | User's mobile phone number |
| `marketing_opt_in` | `boolean` | Not Null | `false` | Consent flag for marketing and campaign communications |
| `created_at` | `timestamptz` | Not Null | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | Not Null | `now()` | Record update timestamp |

**Indexes**:
- `idx_profiles_id`: B-tree index on `profiles(id)` (Primary Key).

**Triggers**:
- `on_auth_user_created`: Database trigger on `auth.users` AFTER INSERT calling `public.handle_new_user()` to populate `profiles` automatically.

**Observed RLS Policies**:
- `profiles_select_policy`: Users can view their own profile and profiles of members sharing a fridge (`fridge_members`).
- `profiles_insert_policy`: System trigger / user insert permissions on registration.
- `profiles_update_policy`: `auth.uid() = id` (Users can only update their own profile).
- `profiles_delete_policy`: `auth.uid() = id` (User account self-deletion cascades to all member data).

---

#### Table 2: `fridges`
Fridge containers representing individual or shared physical kitchen fridges.

| Column | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | Primary Key | `gen_random_uuid()` | Unique fridge identifier |
| `name` | `text` | Not Null | — | Name of the fridge (e.g., "My Kitchen", "Family Fridge") |
| `created_by` | `uuid` | FK `auth.users(id)` / `profiles(id)` ON DELETE SET NULL | `auth.uid()` | User ID of the creator/owner |
| `invite_code` | `text` | Unique, Not Null | `lower(substring(md5(random()::text) from 1 for 6))` | Short 6-character alphanumeric invite code for sharing |
| `created_at` | `timestamptz` | Not Null | `now()` | Creation timestamp |

**Indexes**:
- `idx_fridges_invite_code`: B-tree index on `fridges(invite_code)` for fast RPC lookup during join operations.
- `idx_fridges_created_by`: B-tree index on `fridges(created_by)`.

**Stored Procedures / RPC Functions**:
- `public.join_fridge_by_code(invite_code_input text)`:
  - **Parameters**: `invite_code_input` (text, lowercased & trimmed)
  - **Returns**: JSON object `{"success": boolean, "message": text, "fridge_id": uuid}`
  - **Behavior**: Finds fridge matching `invite_code_input`. Checks if caller `auth.uid()` is already a member. If not, inserts row into `fridge_members(fridge_id, user_id, role='member')`.

**Observed RLS Policies**:
- `fridges_select_policy`: Users can select fridges where `id IN (SELECT fridge_id FROM fridge_members WHERE user_id = auth.uid())`.
- `fridges_insert_policy`: Authenticated users can create new fridges (`auth.role() = 'authenticated'`).
- `fridges_update_policy`: Only fridge owners/creators can update fridge details (`created_by = auth.uid()` or role = 'owner').
- `fridges_delete_policy`: Only fridge owners can delete the fridge (`created_by = auth.uid()`).

---

#### Table 3: `fridge_members`
Junction table tracking user access rights and roles per shared fridge.

| Column | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | Primary Key | `gen_random_uuid()` | Membership row identifier |
| `fridge_id` | `uuid` | FK `fridges(id)` ON DELETE CASCADE, Not Null | — | Target fridge ID |
| `user_id` | `uuid` | FK `auth.users(id)` ON DELETE CASCADE, Not Null | — | Target user ID |
| `role` | `text` | Check constraint (`role IN ('owner', 'member')`) | `'member'` | Permission role in the fridge |
| `joined_at` | `timestamptz` | Not Null | `now()` | Timestamp when user joined the fridge |

**Composite Constraints**:
- `unique_fridge_user`: Unique constraint on `(fridge_id, user_id)` preventing duplicate memberships.

**Indexes**:
- `idx_fridge_members_user_id`: B-tree index on `fridge_members(user_id)` for quick lookup of user's fridges.
- `idx_fridge_members_fridge_id`: B-tree index on `fridge_members(fridge_id)` for listing fridge members.

**Observed RLS Policies**:
- `fridge_members_select`: Users can view memberships for any fridge they belong to.
- `fridge_members_insert`: Users can add themselves via fridge creation or RPC join.
- `fridge_members_delete`: Users can delete their own row (leave fridge) or fridge owners can remove members.

---

#### Table 4: `inventory`
Food items contained within a specific fridge, tracking quantities, categories, statuses, and expiration dates.

| Column | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | Primary Key | `gen_random_uuid()` | Unique inventory item ID |
| `fridge_id` | `uuid` | FK `fridges(id)` ON DELETE CASCADE, Not Null | — | Associated fridge ID |
| `added_by` | `uuid` | FK `auth.users(id)` ON DELETE SET NULL, Not Null | `auth.uid()` | User ID of person who scanned/added the item |
| `name` | `text` | Not Null | `'Unknown'` | Product or food item name |
| `category` | `text` | Check constraint (`category IN ('Produce', 'Dairy', 'Meat', 'Beverage', 'Pantry', 'Leftovers', 'Other')`) | `'Other'` | Food category classification |
| `urgency` | `text` | Check constraint (`urgency IN ('FRESH', 'EXPIRING_SOON', 'EXPIRED')`) | `'FRESH'` | Computed or assigned expiry urgency state |
| `status` | `text` | Check constraint (`status IN ('ACTIVE', 'CONSUMED', 'TRASHED')`) | `'ACTIVE'` | Item state (`ACTIVE` visible in fridge, soft-deleted as `CONSUMED`/`TRASHED`) |
| `quantity` | `numeric` | Not Null, > 0 | `1` | Count or volume quantity |
| `unit` | `text` | Not Null | `'item'` | Unit of measure ('item', 'g', 'oz', 'pack', 'liter') |
| `price` | `numeric` | Nullable | `0` | Item price in USD for waste/savings tracking |
| `image_url` | `text` | Nullable | `NULL` | Product image URL (category fallback or OpenFoodFacts image) |
| `barcode` | `text` | Nullable | `NULL` | EAN/UPC barcode number if scanned |
| `expires_at` | `timestamptz` | Not Null | `now() + interval '7 days'` | Estimated or exact expiration date |
| `created_at` | `timestamptz` | Not Null | `now()` | Added date |
| `updated_at` | `timestamptz` | Not Null | `now()` | Last modified date |

**Indexes**:
- `idx_inventory_fridge_status`: Composite B-tree index on `inventory(fridge_id, status)` (used by main query `.eq('fridge_id', fridgeId).eq('status', 'ACTIVE')`).
- `idx_inventory_expires_at`: B-tree index on `inventory(expires_at ASC)` for expiration sorting and alert scheduling.

**Realtime Publications**:
- `supabase_realtime`: `inventory` table is added to Supabase Realtime publication to allow instant synchronization across roommate devices via `postgres_changes`.

**Observed RLS Policies**:
- `inventory_select`: Members of `fridge_id` (`fridge_id IN (SELECT fridge_id FROM fridge_members WHERE user_id = auth.uid())`) can select active items.
- `inventory_insert`: Members of `fridge_id` can insert items.
- `inventory_update`: Members of `fridge_id` can update status, expires_at, etc.
- `inventory_delete`: Members of `fridge_id` can delete items.

---

#### Table 5: `grocery_list`
Shopping list items shared among fridge members.

| Column | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | Primary Key | `gen_random_uuid()` | Unique grocery list item ID |
| `fridge_id` | `uuid` | FK `fridges(id)` ON DELETE CASCADE, Not Null | — | Associated fridge ID |
| `added_by` | `uuid` | FK `auth.users(id)` ON DELETE SET NULL, Not Null | `auth.uid()` | User who created the grocery entry |
| `name` | `text` | Not Null | — | Grocery item name |
| `quantity` | `numeric` | Not Null | `1` | Quantity to purchase |
| `is_purchased` | `boolean` | Not Null | `false` | Purchased checkbox status |
| `created_at` | `timestamptz` | Not Null | `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | Not Null | `now()` | Modification timestamp |

**Indexes**:
- `idx_grocery_list_fridge_id`: B-tree index on `grocery_list(fridge_id, created_at DESC)`.

**Realtime Publications**:
- `supabase_realtime`: `grocery_list` table enabled for Postgres changes broadcast.

**Observed RLS Policies**:
- `grocery_list_select`: Fridge members can view the grocery list.
- `grocery_list_insert`: Fridge members can add items to the grocery list.
- `grocery_list_update`: Fridge members can toggle `is_purchased` or update quantity.
- `grocery_list_delete`: Fridge members can remove grocery items.

---

## 3. Package Dependencies & Version Constraints

### 3.1 Complete Dependency Manifest (`package.json`)

```json
{
  "name": "smart-fridge-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~0.2.0-beta.9",
    "@google/generative-ai": "^0.24.1",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@supabase/supabase-js": "^2.45.0",
    "ansi-escapes": "^7.3.0",
    "expo": "~54.0.0",
    "expo-camera": "~17.0.10",
    "expo-constants": "~18.0.13",
    "expo-device": "~8.0.10",
    "expo-font": "~14.0.12",
    "expo-glass-effect": "~0.1.10",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-manipulator": "~14.0.8",
    "expo-linking": "~8.0.12",
    "expo-notifications": "~0.32.17",
    "expo-router": "~6.0.24",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.11",
    "nativewind": "4.1.23",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1",
    "tailwindcss": "3.4.15"
  },
  "devDependencies": {
    "@types/react": "~19.1.10",
    "typescript": "~5.9.2"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "private": true
}
```

---

## 4. Build, Bundler & System Configuration Files

### 4.1 Expo App Configuration (`app.json`)
- **App Name**: Smart Fridge AI
- **Slug**: `smart-fridge-app`
- **Bundle Identifier (iOS)**: `com.nizor.smartfridge`
- **Package Name (Android)**: `com.nizor.smartfridge`
- **Custom Scheme**: `smartfridge://`
- **Orientation**: `portrait`
- **Permissions Configured**:
  - `NSCameraUsageDescription`: "Smart Fridge AI uses your camera to scan barcodes and detect food items."
  - `android.permission.CAMERA`
- **Plugins Installed**:
  - `expo-router`
  - `expo-splash-screen` (bg: `#0f172a`, image: `./assets/images/splash-icon.png`)
  - `expo-camera`
  - `expo-notifications` (icon: `./assets/images/icon.png`)
- **Experimental Flags**:
  - `typedRoutes`: `true`
  - `reactCompiler`: `true`

### 4.2 Babel Configuration (`babel.config.js`)
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 4.3 Metro Configuration (`metro.config.js`)
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
```

### 4.4 Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        "primary-glow": "hsl(var(--primary-glow))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        accent: "hsl(var(--accent))",
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
        muted: "hsl(var(--muted))"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
```

### 4.5 TypeScript Configuration (`tsconfig.json`)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

---

## 5. Environment Variables & Runtime Security Context

### 5.1 Active `.env` Variables
- `EXPO_PUBLIC_GEMINI_API_KEY`: API Key for Google Gemini REST endpoints.
- `EXPO_PUBLIC_SUPABASE_URL`: `https://lljudjuoawzigandmtal.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase client-side anonymous key (`sb_publishable_...`).

### 5.2 Security Observations
1. **Anon Key Usage**: The frontend uses `EXPO_PUBLIC_SUPABASE_ANON_KEY`, relying on Supabase RLS policies to restrict data access per user/fridge.
2. **Gemini API Key Exposure**: The Gemini API key is prefixed with `EXPO_PUBLIC_`, bundling it directly into client-side JS bundles. Highly sensitive; should ideally be proxied via Edge Functions or secure backend endpoints.

---

## 6. Features Discovered

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Database / Auth | User Profile Sync | Synchronizes user profile (names, phone, marketing) linked to `auth.users` | Signup form inputs (first_name, last_name, phone) | Profile row in `profiles` table | Handles pending profile fetch during first-time signup trigger | `useAuth.ts`, `settings.tsx` |
| 2 | Database / Auth | Shared Fridges & Invite Codes | Multi-fridge sharing with unique 6-char invite code and role-based access ('owner', 'member') | Fridge name, invite code | Fridge container row, membership entries | Handles invalid invite code or existing membership gracefully | `FridgeContext.tsx`, `useFridges.ts` |
| 3 | Database / Realtime | Shared Inventory Management | Realtime CRUD for fridge inventory items with automatic roommate updates | Fridge ID, item details (name, category, quantity, unit, price, expires_at) | Inventory rows with status ('ACTIVE', 'CONSUMED', 'TRASHED') | Falls back to local AsyncStorage cache on network failure | `useInventory.ts` |
| 4 | Database / Realtime | Shared Grocery List | Realtime grocery list management with purchasing state toggle and sync | Item name, quantity, purchased flag | Grocery item rows in `grocery_list` | Falls back to local AsyncStorage cache when offline | `useGroceryList.ts` |
| 5 | AI Vision | Multimodal Fridge Scanner | Analyzes photo taken by camera using Gemini 3.5 Flash vision model | Compressed JPEG image base64 (1024px width) | Array of JSON food items with categories & expiry dates | Model fallback chain (`gemini-3.5-flash` -> `gemini-3.5-flash-lite`); quota error alerts | `ai.ts`, `CameraScanner.tsx` |
| 6 | Barcode Lookup | OpenFoodFacts Barcode Lookup | Queries Open Food Facts API for product details from barcode | UPC/EAN barcode string | Product name, brand, mapped category, image URL | Returns null if barcode not found in database; shows "Product not found" UI | `barcode.ts`, `CameraScanner.tsx` |
| 7 | AI Generation | AI Recipe Generator | Generates custom recipes based on active fridge inventory contents | Inventory items string list (compressed name/qty) | Structured recipe JSON (title, cookTime, servings, ingredients, instructions) | Fallback hardcoded recipe if fridge is empty | `ai.ts`, `recipes.tsx` |
| 8 | Expiration Engine | Shelf-life & Urgency Engine | Calculates days remaining and urgency level ('FRESH', 'EXPIRING_SOON', 'EXPIRED') | Item category, added date / expiry date | Urgency enum, remaining days count | Defaults shelf life based on category lookup | `expiration.ts` |
| 9 | Local Push | Expiration Reminder Notifications | Schedules local push notifications for food items expiring in 48h and 3-5 days | Inventory item list with `expires_at` | Scheduled `expo-notifications` alerts | Checks notification permissions before scheduling | `notifications.ts` |
| 10 | Security / Auth | Password Reset with Token | Password recovery using 5-minute timed verification token | User email, token code, new password | Password update on Supabase Auth | Validates timer countdown (300s); blocks reset if token expired | `settings.tsx` |

---

## 7. Edge Cases & Observed Vulnerabilities

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | AI Photo Scanning | High-resolution raw camera photo (12MP+) | Transformed & resized via `ImageManipulator` to 1024px width before base64 encoding to avoid memory crashes and token limit errors |
| 2 | Gemini API Response | Truncated or invalid JSON response from Gemini API | Model fallback logic catches `JSON.parse` failures and retries request on `gemini-3.5-flash-lite` |
| 3 | Network Disconnection | Offline state during inventory fetch | Traps fetch failure, sets `isOffline: true`, and reads cached inventory from `AsyncStorage` |
| 4 | Shared Fridge Member Removal | Owner leaves or deletes fridge | Cascades deletion to `fridge_members`, `inventory`, and `grocery_list` rows in Supabase |
| 5 | Barcode Lookup Fallback | Unregistered UPC barcode scanned | `lookupBarcode` returns null, prompting user with "Product not found" card with a retry option |
| 6 | Password Reset Expiry | Expired 5-minute OTP code | Screen disables reset action button and prompts user to request a fresh OTP code |
| 7 | Duplicate Email Signup | User enters an email already registered | Intercepts Supabase auth error and offers modal redirect to Password Reset or Sign In |

