# R2: Next-Generation UI/UX & Visual Overhaul Audit & Specification
**Smart Fridge AI Mobile Application (Expo SDK 54 / React Native 0.81 / Reanimated 3 / NativeWind v4)**

---

## Executive Overview
This report presents an exhaustive UI/UX design overhaul for **Smart Fridge AI**, transitioning the app from a basic dark-theme UI into an ultra-modern, minimalist, accessible mobile experience. Built around an **"Eco-Tech Fresh"** aesthetic, this specification optimizes visual hierarchy, motion design, and thumb-zone ergonomics for effortless one-handed smartphone use.

---

## 2. Next-Generation UI/UX & Visual Overhaul Specification

### 2.1 Minimalist Eco-Tech Design System & Color Palette

The new color architecture balances high-contrast readability, calm modern aesthetics, and clear visual cues for inventory freshness and urgency. 

#### 2.1.1 Design System Color Tokens

| Palette Category | Token Name | Hex Value | HSL Value | Purpose / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary (Brand)** | `primary-50` | `#ECFDF5` | `hsl(152, 81%, 96%)` | Light mode surface accent / subtlest tint |
| | `primary-100` | `#D1FAE5` | `hsl(149, 80%, 90%)` | Badge background (Fresh) |
| | `primary-500` | `#10B981` | `hsl(160, 84%, 39%)` | Primary active actions, success states, buttons |
| | `primary-600` | `#059669` | `hsl(160, 94%, 30%)` | Main Brand Primary CTA, FAB background |
| | `primary-700` | `#047857` | `hsl(161, 90%, 24%)` | Pressed state for primary buttons |
| **Secondary (Mint)** | `secondary-100` | `#E0F2FE` | `hsl(201, 94%, 94%)` | Light active state / subtle blue-mint |
| | `secondary-500` | `#0EA5E9` | `hsl(199, 89%, 48%)` | Accent highlights, fridge selector, secondary buttons |
| | `secondary-900` | `#075985` | `hsl(200, 90%, 27%)` | Dark mode secondary surface border |
| **Accent (Warm)** | `accent-100` | `#FEF3C7` | `hsl(48, 96%, 89%)` | Expiring soon light badge background |
| | `accent-500` | `#F59E0B` | `hsl(38, 92%, 50%)` | Expiring soon status, warning pill, notification dot |
| | `accent-600` | `#D97706` | `hsl(37, 91%, 44%)` | Expiring soon text accent |
| **Neutrals (Dark)** | `slate-950` | `#020617` | `hsl(222, 47%, 4%)` | Pure dark background (OLED dark mode) |
| | `slate-900` | `#0F172A` | `hsl(222, 47%, 11%)` | Primary application background (Dark mode) |
| | `slate-850` | `#172033` | `hsl(221, 38%, 15%)` | Card surface / bottom sheet background |
| | `slate-800` | `#1E293B` | `hsl(215, 28%, 17%)` | Elevated card surface / input background |
| | `slate-700` | `#334155` | `hsl(215, 25%, 27%)` | Subtle borders, dividers, skeleton base |
| | `slate-500` | `#64748B` | `hsl(215, 16%, 47%)` | Muted text, disabled icons |
| | `slate-400` | `#94A3B8` | `hsl(215, 20%, 65%)` | Secondary text, inactive tab labels |
| | `slate-100` | `#F1F5F9` | `hsl(210, 40%, 96%)` | Light mode surface container |
| | `slate-50` | `#F8FAFC` | `hsl(210, 40%, 98%)` | Primary text in Dark mode / Light mode background |
| **Semantic Status** | `success-bg` | `#064E3B` | `hsl(163, 85%, 16%)` | Consumed item background (20% opacity tint) |
| | `success-fg` | `#34D399` | `hsl(158, 64%, 52%)` | Success checkmarks, consumed badge text |
| | `warning-bg` | `#78350F` | `hsl(21, 77%, 26%)` | Expiring soon card highlight tint |
| | `warning-fg` | `#FBBF24` | `hsl(43, 96%, 56%)` | Warning text & reticle focus indicator |
| | `danger-bg` | `#7F1D1D` | `hsl(0, 63%, 31%)` | Expired / Trash background tint |
| | `danger-fg` | `#F87171` | `hsl(0, 93%, 70%)` | Expired status, delete swipe action color |
| | `info-bg` | `#1E3A8A` | `hsl(224, 64%, 33%)` | AI tip / offline status tint |
| | `info-fg` | `#60A5FA` | `hsl(217, 91%, 68%)` | AI Assistant text accent |

---

#### 2.1.2 Design Tokens Integration Code (`src/constants/theme.ts`)

```typescript
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8FAFC',
    backgroundSurface: '#FFFFFF',
    backgroundElevated: '#F1F5F9',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#059669',
    primaryHover: '#047857',
    primarySubtle: '#D1FAE5',
    secondary: '#0EA5E9',
    accent: '#F59E0B',
    danger: '#DC2626',
    dangerSubtle: '#FEE2E2',
    warning: '#D97706',
    warningSubtle: '#FEF3C7',
    success: '#10B981',
    successSubtle: '#D1FAE5',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    background: '#0F172A',
    backgroundSurface: '#172033',
    backgroundElevated: '#1E293B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#10B981',
    primaryHover: '#059669',
    primarySubtle: 'rgba(16, 185, 129, 0.15)',
    secondary: '#38BDF8',
    accent: '#F59E0B',
    danger: '#EF4444',
    dangerSubtle: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B',
    warningSubtle: 'rgba(245, 158, 11, 0.15)',
    success: '#10B981',
    successSubtle: 'rgba(16, 185, 129, 0.15)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export const HSLColors = {
  primary: { h: 160, s: 84, l: 39 },
  secondary: { h: 199, s: 89, l: 48 },
  accent: { h: 38, s: 92, l: 50 },
  danger: { h: 0, s: 84, l: 60 },
  warning: { h: 38, s: 92, l: 50 },
  success: { h: 160, s: 84, l: 39 },
};
```

---

### 2.2 Typography System & Hierarchy

The typography architecture uses **Plus Jakarta Sans** for display/headings (modern geometric feel with warmth) and **Inter** for dense tabular/numerical data (inventory counts, expiry dates, prices).

#### 2.2.1 Typographic Scale & Properties Matrix

| Style Token | Font Family | Size (px) | Size (rem) | Line Height (px) | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-4xl` | Plus Jakarta Sans | 36px | 2.25rem | 44px | Bold (700) | -0.8px |
| `heading-3xl` | Plus Jakarta Sans | 30px | 1.875rem | 38px | Bold (700) | -0.6px |
| `heading-2xl` | Plus Jakarta Sans | 24px | 1.5rem | 32px | SemiBold (600) | -0.4px |
| `heading-xl` | Plus Jakarta Sans | 20px | 1.25rem | 28px | SemiBold (600) | -0.2px |
| `title-lg` | Plus Jakarta Sans | 18px | 1.125rem | 26px | Medium (500) | 0.0px |
| `body-base` | Inter | 16px | 1.0rem | 24px | Regular (400) | 0.0px |
| `body-sm` | Inter | 14px | 0.875rem | 20px | Regular (400) | 0.1px |
| `caption-xs` | Inter | 12px | 0.75rem | 16px | Medium (500) | 0.2px |
| `micro-badge` | Plus Jakarta Sans | 10px | 0.625rem | 14px | Bold (700) | 0.5px (Uppercase) |

---

#### 2.2.2 Typography Implementation (`src/constants/typography.ts`)

```typescript
import { StyleSheet, TextStyle } from 'react-native';

export const Typography = StyleSheet.create({
  display4xl: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.8,
    fontWeight: '700',
  } as TextStyle,
  heading3xl: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.6,
    fontWeight: '700',
  } as TextStyle,
  heading2xl: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
    fontWeight: '600',
  } as TextStyle,
  headingXl: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '600',
  } as TextStyle,
  titleLg: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  } as TextStyle,
  bodyBase: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,
  bodySm: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,
  captionXs: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  } as TextStyle,
  microBadge: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  } as TextStyle,
});
```

---

### 2.3 Premium Reanimated 3 Micro-Interactions

Here are 5 fully modular, copy-paste-ready Reanimated 3 components implementing essential fluid interactions.

#### 2.3.1 Interaction 1: Swipeable & Layout-Animated Inventory Item Card
**File**: `src/components/SwipeableInventoryCard.tsx`
- **Features**: PanGestureHandler, Swipe Left to Delete (Red disclosure with trash icon), Swipe Right to Consume (Green disclosure with checkmark icon), Spring snap-back, Haptic feedback trigger upon crossing 90px threshold, smooth `Layout.springify()` deletion animation.

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeInDown,
  Layout,
  FadeOutLeft,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;

export type InventoryCardProps = {
  item: {
    id: string;
    name: string;
    category: string;
    urgency: 'EXPIRED' | 'EXPIRING_SOON' | 'FRESH';
    daysLeft?: number;
    image_url?: string;
    quantity?: number;
    price?: number;
  };
  index: number;
  onDelete: (id: string) => void;
  onConsume: (id: string) => void;
};

export default function SwipeableInventoryCard({ item, index, onDelete, onConsume }: InventoryCardProps) {
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // Trigger haptic when user crosses action threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (Math.abs(event.translationX) <= SWIPE_THRESHOLD) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe Left -> Delete
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(onDelete)(item.id);
        });
      } else if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe Right -> Consume
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(onConsume)(item.id);
        });
      } else {
        // Return to neutral
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
      hasTriggeredHaptic.value = false;
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? withTiming(1) : 0,
  }));

  const consumeActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? withTiming(1) : 0,
  }));

  const urgencyColors = {
    EXPIRED: '#EF4444',
    EXPIRING_SOON: '#F59E0B',
    FRESH: '#10B981',
  };

  const badgeColor = urgencyColors[item.urgency] || urgencyColors.FRESH;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(15)}
      exiting={FadeOutLeft.duration(200)}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      {/* Back Layer Actions */}
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.actionLeft, consumeActionStyle]}>
          <MaterialCommunityIcons name="check-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Consumed</Text>
        </Animated.View>
        <Animated.View style={[styles.actionRight, deleteActionStyle]}>
          <Text style={styles.actionText}>Trash</Text>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FFFFFF" />
        </Animated.View>
      </View>

      {/* Front Layer Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <View style={styles.imageFallback}>
              <MaterialCommunityIcons name="food-apple" size={26} color="#94A3B8" />
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.category}>
              {item.category} {item.quantity ? `· ${item.quantity} units` : ''}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: `${badgeColor}20`, borderColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {item.daysLeft !== undefined
                  ? item.daysLeft <= 0
                    ? 'Expired'
                    : `${item.daysLeft}d left`
                  : item.urgency}
              </Text>
            </View>
            {item.price ? <Text style={styles.price}>${item.price.toFixed(2)}</Text> : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 10,
    position: 'relative',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionLeft: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 8,
  },
  actionRight: {
    flex: 1,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  imageFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  price: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
```

---

#### 2.3.2 Interaction 2: Seamless Screen Route Transition Container
**File**: `src/components/AnimatedScreenWrapper.tsx`
- **Features**: Shared route entry/exit transition using Reanimated 3 `FadeInRight` / `FadeOutLeft` with custom easing curve and subtle depth scaling.

```tsx
import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Easing,
} from 'react-native-reanimated';

interface AnimatedScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

export default function AnimatedScreenWrapper({ children, style, ...props }: AnimatedScreenWrapperProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutLeft.duration(240).easing(Easing.in(Easing.cubic))}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
```

---

#### 2.3.3 Interaction 3: Custom Animated Pull-to-Refresh Control
**File**: `src/components/FridgePullToRefresh.tsx`
- **Features**: Pull-down gesture tracker with animated fridge door opening angle and dynamic spinning snowflake indicator. Corrected Reanimated 3 worklet implementation separating UI thread animation worklet execution from JS thread async callback using `runOnJS`.

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const PULL_THRESHOLD = 80;

type Props = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
};

export default function FridgePullToRefresh({ onRefresh, children }: Props) {
  const pullY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const spinValue = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // JS thread callback to perform async refresh and safely update shared values when finished
  const executeRefresh = async () => {
    try {
      await onRefresh();
    } finally {
      pullY.value = withSpring(0, { damping: 15 });
      isRefreshing.value = false;
      spinValue.value = 0;
    }
  };

  // Synchronous UI thread worklet function to launch animations and trigger JS callback
  const startRefresh = () => {
    'worklet';
    isRefreshing.value = true;
    spinValue.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    runOnJS(executeRefresh)();
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0 && !isRefreshing.value) {
        pullY.value = Math.min(event.translationY * 0.5, PULL_THRESHOLD + 20);
        if (pullY.value >= PULL_THRESHOLD && pullY.value < PULL_THRESHOLD + 5) {
          runOnJS(triggerHaptic)();
        }
      }
    })
    .onEnd(() => {
      if (pullY.value >= PULL_THRESHOLD && !isRefreshing.value) {
        pullY.value = withSpring(PULL_THRESHOLD);
        startRefresh();
      } else if (!isRefreshing.value) {
        pullY.value = withSpring(0);
      }
    });

  const pullContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => {
    const scale = Math.min(pullY.value / PULL_THRESHOLD, 1.2);
    const rotation = isRefreshing.value ? `${spinValue.value}deg` : `${(pullY.value / PULL_THRESHOLD) * 180}deg`;
    return {
      transform: [{ scale }, { rotate: rotation }],
      opacity: Math.min(pullY.value / (PULL_THRESHOLD * 0.5), 1),
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerIndicator}>
        <Animated.View style={[styles.iconBox, iconStyle]}>
          <MaterialCommunityIcons
            name={isRefreshing.value ? "snowflake" : "fridge-outline"}
            size={28}
            color="#10B981"
          />
        </Animated.View>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, pullContainerStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerIndicator: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  content: {
    flex: 1,
  },
});
```

---

#### 2.3.4 Interaction 4: Shimmer Skeleton Loader Component
**File**: `src/components/ShimmerSkeleton.tsx`
- **Features**: Linear sweep gradient skeleton placeholder for card, list, and stat modes, running a continuous Reanimated 3 animation loop.

```tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  variant?: 'card' | 'stat' | 'avatar';
  count?: number;
}

export default function ShimmerSkeleton({ variant = 'card', count = 3 }: Props) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]);
    return {
      transform: [{ translateX }],
    };
  });

  const renderShimmerOverlay = () => (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.shimmerBeam, shimmerStyle]} />
    </View>
  );

  if (variant === 'stat') {
    return (
      <View style={styles.statRow}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.statBox}>
            <View style={styles.statBarShort} />
            <View style={styles.statBarLong} />
            {renderShimmerOverlay()}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardBox}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.textColumn}>
            <View style={styles.titleLine} />
            <View style={styles.subtitleLine} />
          </View>
          <View style={styles.badgePlaceholder} />
          {renderShimmerOverlay()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  cardBox: {
    height: 72,
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  titleLine: {
    width: '65%',
    height: 14,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  subtitleLine: {
    width: '40%',
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  badgePlaceholder: {
    width: 50,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    height: 80,
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  statBarShort: {
    width: '40%',
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  statBarLong: {
    width: '70%',
    height: 20,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  shimmerBeam: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
```

---

#### 2.3.5 Interaction 5: Haptic Feedback Pattern Integration with Camera Scan Reticle
**File**: `src/components/ScanReticleView.tsx`
- **Features**: Interactive camera focus frame with corner bracket pulse animations, laser scan line bounce, and contextual Expo Haptics (`ImpactFeedbackStyle.Light`, `NotificationFeedbackType.Success`, `NotificationFeedbackType.Error`).

```tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type ReticleStatus = 'idle' | 'focusing' | 'success' | 'error';

interface Props {
  status: ReticleStatus;
  mode: 'Photo' | 'Barcode';
}

export default function ScanReticleView({ status, mode }: Props) {
  const pulseScale = useSharedValue(1);
  const scanBeamY = useSharedValue(0);

  const triggerStatusHaptic = (st: ReticleStatus) => {
    if (st === 'focusing') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (st === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (st === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  useEffect(() => {
    triggerStatusHaptic(status);

    if (status === 'focusing' || status === 'idle') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 700 }),
          withTiming(1.0, { duration: 700 })
        ),
        -1,
        true
      );
    } else if (status === 'success') {
      pulseScale.value = withTiming(1.12, { duration: 150 });
    }

    if (mode === 'Barcode') {
      scanBeamY.value = withRepeat(
        withSequence(
          withTiming(200, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [status, mode]);

  const reticleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    borderColor:
      status === 'success'
        ? '#10B981'
        : status === 'error'
        ? '#EF4444'
        : '#FFFFFF',
  }));

  const beamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanBeamY.value }],
    opacity: mode === 'Barcode' ? 1 : 0,
  }));

  return (
    <View style={styles.centerContainer}>
      <Animated.View style={[styles.reticleBox, reticleAnimatedStyle]}>
        {/* Corner Brackets */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Dynamic Laser Beam */}
        <Animated.View style={[styles.laserBeam, beamAnimatedStyle]} />
      </Animated.View>

      <Text style={styles.guideText}>
        {status === 'focusing'
          ? 'Analyzing image with Gemini Vision...'
          : mode === 'Barcode'
          ? 'Align barcode inside reticle'
          : 'Center food item in frame'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#10B981',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  laserBeam: {
    height: 2,
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  guideText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
```

---

### 2.4 One-Handed Mobile UX Critique & Screen Layout Refactoring

Mobile UX research shows that **75% of single-handed smartphone interaction** occurs strictly within the bottom two-thirds of the screen (the "Natural Thumb Zone"). Top corners require uncomfortable hand shifts.

```
+-------------------+  <- HARD REACH ZONE (Avoid primary actions here)
|   [Top Header]    |
|                   |  <- NATURAL TOUCH ZONE (Filters, cards, search)
|                   |
|  (FAB / ACTIONS)  |  <- EASY THUMB SWIPE ZONE (Bottom Bar, Bottom Action Sheets)
+-------------------+
```

---

#### 2.4.1 Screen 1: Dashboard / Inventory Home (`src/app/(tabs)/index.tsx`)

##### Critique & Refactoring
- **Current Defect**: Floating Action Button (FAB) is fixed at `bottom: 80, right: 24`. On right-hand use, this blocks item card right badges. On left-hand use, it requires stretching across the screen.
- **Solution**: Shift primary actions to a **Bottom Action Bar** integrated into the navigation layout. Relocate the scan button to a central prominent bottom dock. Convert the top header fridge selector into a bottom-sheet trigger reachable with a single thumb tap.

```tsx
// Refactored Bottom Bar Layout Snippet for Index Screen
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function BottomDockActionBar({ onScanPress, onFilterPress }: { onScanPress: () => void; onFilterPress: () => void }) {
  return (
    <View style={styles.dockContainer}>
      <TouchableOpacity style={styles.dockButton} onPress={onFilterPress}>
        <MaterialCommunityIcons name="filter-variant" size={22} color="#94A3B8" />
        <Text style={styles.dockLabel}>Filter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerScanFab} onPress={onScanPress} activeOpacity={0.85}>
        <MaterialCommunityIcons name="camera-plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.dockButton} onPress={() => {}}>
        <MaterialCommunityIcons name="sort" size={22} color="#94A3B8" />
        <Text style={styles.dockLabel}>Sort</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(23, 32, 51, 0.95)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  dockButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  dockLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  centerScanFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
```

---

#### 2.4.2 Screen 2: Grocery Shopping List (`src/app/(tabs)/list.tsx`)

##### Critique & Refactoring
- **Current Defect**: "Add Custom Item" text input field is pinned to the top of the list view. Users must reach up to type, opening the soft keyboard which pushes content out of view.
- **Solution**: Move the item input into a **Sticky Bottom Keyboard Bar** or an animated bottom drawer that lifts automatically when tapping "Add Item".

```tsx
// Bottom Keyboard Input Bar Snippet for Grocery List
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function BottomGroceryInputBar({ onAddItem }: { onAddItem: (name: string) => void }) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddItem(text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={85}>
      <View style={styles.inputBarContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Add grocery item (e.g., Almond Milk)..."
          placeholderTextColor="#64748B"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: text.trim() ? '#10B981' : '#334155' }]}
          onPress={handleAdd}
          disabled={!text.trim()}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172033',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#0F172A',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

#### 2.4.3 Screen 3: AI Recipe Generator (`src/app/(tabs)/recipes.tsx`)

##### Critique & Refactoring
- **Current Defect**: Dietary filter chips (Vegan, Keto, Quick & Easy) are rendered in a horizontal scroll view at the top. Selecting ingredients requires repeated top-screen taps.
- **Solution**: Move ingredient selection & filter presets into a **Swipeable Bottom Control Sheet** with large touch targets. Place the primary "Generate Recipes with Gemini" button in a prominent bottom bar.

```tsx
// Bottom CTA Bar Snippet for AI Recipe Generator
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function RecipeGenerateBottomBar({ onGenerate, selectedCount }: { onGenerate: () => void; selectedCount: number }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.generateButton} onPress={onGenerate} activeOpacity={0.85}>
        <MaterialCommunityIcons name="auto-fix" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          Generate Recipes ({selectedCount} items)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  generateButton: {
    height: 54,
    backgroundColor: '#059669',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
```

---

#### 2.4.4 Screen 4: Settings & Fridge Management (`src/app/(tabs)/settings.tsx`)

##### Critique & Refactoring
- **Current Defect**: Account management actions ("Sign Out", "Create New Fridge", "Join Household") are scattered in long vertical card sections requiring extensive scrolling.
- **Solution**: Re-group options into ergonomic categorized cards with bottom action triggers. Primary CTA buttons ("Create Fridge", "Invite Member") open bottom action sheets.

```tsx
// Settings Bottom Sheet Switcher Trigger Code Snippet
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function BottomSettingsCard({ userEmail, onManageFridges, onSignOut }: any) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userEmail ? userEmail.charAt(0).toUpperCase() : 'G'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userEmail || 'Guest User'}</Text>
          <Text style={styles.profileRole}>Household Owner</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.rowItem} onPress={onManageFridges}>
        <MaterialCommunityIcons name="fridge-outline" size={22} color="#10B981" />
        <Text style={styles.rowLabel}>Manage Household Fridges</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]} onPress={onSignOut}>
        <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        <Text style={[styles.rowLabel, { color: '#EF4444' }]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#172033',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  profileRole: {
    color: '#94A3B8',
    fontSize: 13,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowLabel: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
  },
});
```

---

#### 2.4.5 Screen 5: Camera Scanner Modal (`src/components/CameraScanner.tsx`)

##### Critique & Refactoring
- **Current Defect**: Flash toggle and close buttons at `top: 60` are hard to reach during one-handed camera operation.
- **Solution**: Relocate flash toggle and mode switcher (Photo vs Barcode) into a **Bottom Floating Controls Bar** positioned directly above the shutter button.

```tsx
// Bottom Camera Overlay Controls Snippet
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function BottomCameraOverlayControls({ mode, setMode, flash, setFlash, onCapture }: any) {
  return (
    <View style={styles.bottomOverlay}>
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modePill, mode === 'Photo' && styles.modePillActive]}
          onPress={() => setMode('Photo')}
        >
          <Text style={[styles.modeText, mode === 'Photo' && styles.modeTextActive]}>AI Vision</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modePill, mode === 'Barcode' && styles.modePillActive]}
          onPress={() => setMode('Barcode')}
        >
          <Text style={[styles.modeText, mode === 'Barcode' && styles.modeTextActive]}>Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shutterRow}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => setFlash(!flash)}>
          <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutterButton} onPress={onCapture} activeOpacity={0.8}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <View style={{ width: 44 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
  },
  modeBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modePillActive: {
    backgroundColor: '#10B981',
  },
  modeText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  shutterInner: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    backgroundColor: '#10B981',
  },
});
```

---

### 2.5 Complete Navigation Flow Description

#### 2.5.1 System Tab Routes & Screen Hierarchy Map
The application follows Expo Router file-based routing architecture with a main tab navigator and nested modal stacks:

```
Root Layout (_layout.tsx Stack)
 ├── (tabs) Root Tab Navigator (_layout.tsx)
 │    ├── index.tsx (Dashboard / Smart Inventory Overview)
 │    │    ├── [Modal] CameraScanner.tsx (Photo AI / Barcode Scanner)
 │    │    ├── [Modal] ItemDetailModal.tsx (Expiry / Quantity edit)
 │    │    └── [Modal] FridgePickerBottomSheet.tsx (Household Switcher)
 │    ├── list.tsx (Smart Grocery & Restock List Sync)
 │    │    └── [Modal] AddGroceryItemModal.tsx (Custom Item / Inventory Import)
 │    ├── recipes.tsx (AI Recipe Generator & Meal Planner)
 │    │    └── [Modal] RecipeDetailModal.tsx (Ingredients & Cooking Steps)
 │    └── settings.tsx (Household & Fridge Management)
 │         ├── [Modal] AuthModal.tsx (Sign In / Register)
 │         └── [Modal] ManageFridgesModal.tsx (Invite Code Generator / Join Household)
 └── +not-found.tsx (404 Fallback Route)
```

1. **`/(tabs)/index.tsx` (Dashboard & Inventory Overview)**:
   - *Primary Route*: Home screen listing all active fridge inventory grouped by shelf category or urgency tier (Expired, Expiring Soon, Fresh).
   - *Actions*: Pull-to-refresh (`FridgePullToRefresh`), item swipe-to-delete / swipe-to-consume (`SwipeableInventoryCard`), quick filter pill selection, bottom dock scan trigger (`CameraScanner`).

2. **`/(tabs)/list.tsx` (Smart Grocery Shopping List)**:
   - *Primary Route*: Synchronized grocery checklist showing auto-added expiring items and manual entries.
   - *Actions*: Checkbox item completion (auto-moves to consumed), quick add bottom keyboard input bar, clear completed items.

3. **`/(tabs)/recipes.tsx` (AI Recipe Generator)**:
   - *Primary Route*: Gemini AI recipe discovery engine matching available inventory to dietary presets (Keto, Vegan, Quick & Easy).
   - *Actions*: Ingredient multi-selection, recipe card tap opening `RecipeDetailModal`, bottom CTA button to trigger Gemini generation.

4. **`/(tabs)/settings.tsx` (Settings & Household Management)**:
   - *Primary Route*: Profile, active fridge switcher, household member invite code management, theme toggle, and account authorization status.
   - *Actions*: Tap profile to open `AuthModal`, tap "Manage Household Fridges" to trigger `ManageFridgesModal`.

---

#### 2.5.2 Modal Hierarchies & Sub-Modal Navigation Architecture

```
                                  [ (tabs) Stack ]
                                         │
       ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
       │                  │              │              │                  │
       ▼                  ▼              ▼              ▼                  ▼
[CameraScanner]   [ItemDetailModal] [FridgePicker] [RecipeDetail]  [ManageFridgesModal]
       │                                                │                  │
       ▼ (Sub-modal)                                    ▼ (Sub-modal)      ▼ (Sub-modal)
[AIScanResultSheet]                             [MissingIngredients]  [InviteQRCodeSheet]
```

- **Primary Modals**:
  - `CameraScanner.tsx`: Full-screen modal (`presentation: 'fullScreenModal'`). Provides photo AI capture and barcode scanner modes. Includes camera preview, corner reticle pulse, and flash controls.
  - `ItemDetailModal.tsx`: Page sheet modal (`presentation: 'pageSheet'`) for editing specific item properties (name, quantity, purchase date, expiry date, category, photo URL).
  - `FridgePickerBottomSheet.tsx`: Non-blocking bottom sheet modal for switching between home, office, or shared family fridges.
  - `AddGroceryItemModal.tsx`: Bottom action sheet with autocomplete suggestions for quickly adding grocery items.
  - `RecipeDetailModal.tsx`: Slide-up modal presenting complete recipe breakdown, estimated cooking time, calorie count, step-by-step instructions, and macro breakdown.
  - `AuthModal.tsx`: Form sheet modal for user login, signup, and password reset flows with Supabase Auth integration.
  - `ManageFridgesModal.tsx`: Household settings modal to create new fridges, generate shareable invite codes, or join existing households.

- **Sub-Modal & Sheet Hierarchies**:
  - *AI Scan Results Review Sheet*: Opens on top of `CameraScanner.tsx` after Gemini Vision parses a photo, allowing the user to review, edit, or reject parsed items before committing to Supabase inventory.
  - *Missing Ingredients Quick-Add Sheet*: Opens over `RecipeDetailModal.tsx` when a user chooses to cook a recipe that requires missing ingredients, allowing one-tap addition of missing items to `list.tsx`.
  - *Invite QR Code Display Sheet*: Opens over `ManageFridgesModal.tsx` to generate a high-resolution QR code for instant scan-to-join household onboarding.

---

#### 2.5.3 Stack Transitions & Shared Element Motion Specs
- **Tab Route Transitions**: Custom `AnimatedScreenWrapper` component applying Reanimated 3 `FadeInRight` (duration: 320ms, easing: `cubic-out`) on screen entry and `FadeOutLeft` (duration: 240ms, easing: `cubic-in`) on screen exit.
- **Modal Stack Animations**: Native slide-from-bottom (`animation: 'slide_from_bottom'`, duration: 300ms) with spring physics for bottom sheets (`damping: 20`, `stiffness: 180`).
- **Shared Element Transitions**: Smooth shared element bounds morphing between inventory card item thumbnails on `index.tsx` and header images on `ItemDetailModal.tsx`.
- **Dismissal Gesture Dynamics**: Full interactive swipe-down gesture (`gestureEnabled: true`, `fullScreenGesture: true`) with velocity-sensitive spring dismissal for all modals and sheets.

---

#### 2.5.4 Edge States & Fallback Architecture Specification

| Edge State Condition | Visual Trigger / Component | User Experience & Recovery Action |
| :--- | :--- | :--- |
| **Empty Fridge** | `ListEmptyComponent` on `index.tsx` | Displays clean empty fridge SVG graphic, bold heading *"Your fridge is fresh & empty"*, secondary copy *"Scan groceries or add items manually to start tracking expiration dates."*, and prominent emerald button *"Scan First Item"* triggering `CameraScanner.tsx`. |
| **Empty Grocery List** | `ListEmptyComponent` on `list.tsx` | Displays shopping basket graphic with copy *"All restocked! No pending grocery items."* and button *"Add Grocery Item"*. |
| **Offline Mode** | `isOffline === true` Glassmorphism Banner | Non-intrusive sticky top banner (*"Offline Mode — Showing Cached Items"*). Write actions (add/delete/consume) write locally to `AsyncStorage` and queue background Supabase sync upon network recovery. |
| **Camera Access Denied** | Permission Request Overlay | Full-screen dark view with camera icon illustration, clear rationale text (*"Smart Fridge AI requires camera permission to scan barcodes and analyze food items."*), and button *"Open Device Settings"* launching system settings deep link. |
| **Gemini AI Parsing Truncated/Failed** | Error Toast & Fallback Modal | Shows alert toast (*"AI parse incomplete. Switching to manual confirmation."*) and immediately transitions to `ItemDetailModal.tsx` pre-populated with raw recognized OCR text chips for quick manual validation. |
| **Unauthenticated Guest Mode** | Top Warning Pill | Persistent muted warning banner on `settings.tsx` and `index.tsx`: *"Guest Mode — Data stored locally on device. Sign in to sync across family fridges."* with one-tap link to `AuthModal.tsx`. |

---

## Conclusion & Action Plan
With these specs, modern color tokens, typography scale, Reanimated 3 components (with corrected worklet thread syntax), and bottom-aligned one-handed UX patterns, **Smart Fridge AI** gains a polished visual design system ready for App Store submission.

---
*Report compiled by Lead UI/UX Product Designer.*
