/**
 * TagCardShared — Elite Multi-Type Design System
 *
 * ─── v4: PrimaryCommButton — Complete Rebuild ────────────────────────────────
 *
 * ROOT PROBLEM IN v3:
 *   Buttons were vertical tiles with content anchored to the BOTTOM.
 *   This made them read as labels, not actions. The icon was 40×40
 *   buried at the bottom — zero visual authority. The layout felt
 *   like an afterthought rather than a primary tap target.
 *
 * THE FIX — New button anatomy (top to bottom):
 *
 *   ┌──────────────────────────────┐
 *   │  ░░░░ shine bar (glass lip) │  ← 1px white gradient — creates depth
 *   │                              │
 *   │        ┌──────────┐          │
 *   │        │ 🔵icon   │         │  ← 52×52 circle, centered, icon glow ring
 *   │        └──────────┘          │
 *   │                              │
 *   │       CALL OWNER             │  ← 15px/800 — main label
 *   │    ╔ PRIVATE NUMBER ╗        │  ← shield pill — smaller, refined
 *   │                              │
 *   └──────────────────────────────┘
 *
 * KEY CHANGES:
 *   1. Content is CENTERED not bottom-anchored — reads as a real button
 *   2. Icon is 52×52 (was 40×40) — proper visual anchor
 *   3. Icon circle has a pulsing inner glow ring on ACTIVE state
 *   4. Shine bar at top — glass depth without blur overhead
 *   5. Gradient goes corner-to-corner (0,0 → 1,1) with 3 stops for richness
 *   6. Label is 15px (was 13px) and has tighter tracking
 *   8. minHeight: 118px (was 90px) — more touchable, more presence
 *   9. Border radius follows card type (compact=16, kids/pets=20)
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Tag } from '../../store/tagStore';

// ─── Shared Design Tokens ─────────────────────────────────────────────────────

export const U = 8;
export const sp = (n: number) => U * n;

export const R = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  '3xl': 36,
  full: 9999,
};

export const MOTION = {
  cardPress: { speed: 300, bounciness: 0, bounceBack: { speed: 180, bounciness: 6 } },
  btnPress: { speed: 350, bounciness: 0, bounceBack: { speed: 180, bounciness: 12 } },
  btnScale: 0.94,
  cardScale: 0.973,
  glowSpring: { speed: 22, bounciness: 0 },
  toggleSpring: { speed: 28, bounciness: 7 },
};

// ─── Communication Channel Tokens ─────────────────────────────────────────────

export const COMM = {
  // Call — deep sapphire → electric blue
  callGrad: ['#1338BE', '#1D4ED8', '#3B82F6'] as const,
  callGlow: 'rgba(59,130,246,0.5)',
  callIconBg: 'rgba(255,255,255,0.18)',
  callIconGlow: 'rgba(147,197,253,0.35)',

  // WhatsApp — forest → signal green (exact brand)
  waGrad: ['#064E3B', '#065F46', '#059669'] as const,
  waGlow: 'rgba(5,150,105,0.5)',
  waIconBg: 'rgba(255,255,255,0.18)',
  waIconGlow: 'rgba(110,231,183,0.35)',

  // SMS
  sms: '#F59E0B',
  smsBg: 'rgba(245,158,11,0.14)',
};

// SMS toggle geometry
const TRACK_W = 46;
const TRACK_H = 27;
const THUMB_SIZE = 21;
const TRAVEL = TRACK_W - THUMB_SIZE - 4;

// ─── Per-Type Configuration ───────────────────────────────────────────────────

export type TagDomain = 'CAR' | 'KID' | 'PET';

export interface TypeConfig {
  domain: TagDomain;
  cardGrad: readonly [string, string, string];
  accent: string;
  accentMuted: string;
  accentFrost: string;
  borderColor: string;
  activeColor: string;
  typeIcon: string;
  typeLabel: string;
  headerVariant: 'compact' | 'centered';
  identifierVariant: 'plate' | 'name-lg';
  identifierFontSize: number;
  callLabel: string;
  callSublabel: string;
  waLabel: string;
  waSublabel: string;
  /** Card border radius override (kids = more rounded) */
  cardRadius: number;
  /** Button border radius */
  btnRadius: number;
  /** Background paw icons (Pet only) */
  paws?: Array<{ top?: number; left?: number; right?: number; bottom?: number; size: number; rotation: string; opacity: number }>;
  orb1Style?: { width: number; height: number; borderRadius: number; top: number; right: number };
  orb2Style?: { width: number; height: number; borderRadius: number; bottom: number; left: number };
}

export function getTypeConfig(domain: TagDomain, isDark: boolean): TypeConfig {
  if (domain === 'CAR') {
    const yellow = '#FACC15';
    const darkCharcoal = '#1A1106';

    const accent = isDark ? yellow : darkCharcoal;
    const accentMuted = isDark ? 'rgba(250, 204, 21, 0.6)' : 'rgba(26, 17, 6, 0.65)';
    const accentFrost = isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(26, 17, 6, 0.04)';
    const borderColor = isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(26, 17, 6, 0.12)';

    return {
      domain,
      cardGrad: isDark
        ? ['#000000', '#09090B', '#111827']
        : ['#fbd438ff', '#e3dbc4ff', '#fbd438ff'], // Industrial Yellow
      accent,
      accentMuted,
      accentFrost,
      borderColor,
      activeColor: isDark ? yellow : '#000000',
      typeIcon: 'car-sport',
      typeLabel: 'VEHICLE',
      headerVariant: 'compact',
      identifierVariant: 'plate',
      identifierFontSize: 28,
      callLabel: 'Masked Call',
      callSublabel: 'Private Number',
      waLabel: 'WhatsApp',
      waSublabel: 'Masked Chat',
      cardRadius: R.xl,
      btnRadius: R.lg,
      orb1Style: { width: 180, height: 180, borderRadius: 90, top: -60, right: -40 },
      orb2Style: { width: 80, height: 80, borderRadius: 40, bottom: -20, left: -15 },
    };
  }

  if (domain === 'KID') {
    const accent = isDark ? '#BAE6FD' : '#1D4ED8';
    return {
      domain,
      cardGrad: isDark
        ? ['#0C1445', '#1E3A6E', '#1D4ED8']
        : ['#EFF6FF', '#DBEAFE', '#BFDBFE'],
      accent,
      accentMuted: isDark ? 'rgba(186,230,253,0.6)' : 'rgba(29,78,216,0.55)',
      accentFrost: isDark ? 'rgba(186,230,253,0.08)' : 'rgba(29,78,216,0.06)',
      borderColor: isDark ? 'rgba(186,230,253,0.12)' : 'rgba(29,78,216,0.12)',
      activeColor: isDark ? '#6EE7B7' : '#059669',
      typeIcon: 'happy-outline',
      typeLabel: 'CHILD',
      headerVariant: 'centered',
      identifierVariant: 'name-lg',
      identifierFontSize: 26,
      callLabel: 'Call Guardian',
      callSublabel: 'Private Number',
      waLabel: 'Message Guardian',
      waSublabel: 'Masked Chat',
      cardRadius: R['2xl'],
      btnRadius: R.xl,
      orb1Style: { width: 220, height: 220, borderRadius: 110, top: -90, right: -60 },
      orb2Style: { width: 120, height: 120, borderRadius: 60, bottom: -40, left: -30 },
    };
  }

  // PET
  const accent = isDark ? '#FED7AA' : '#C2410C';
  return {
    domain: 'PET',
    cardGrad: isDark
      ? ['#1C0A00', '#3D1500', '#7C2D12']
      : ['#FFF7ED', '#FFEDD5', '#FED7AA'],
    accent,
    accentMuted: isDark ? 'rgba(254,215,170,0.6)' : 'rgba(194,65,12,0.55)',
    accentFrost: isDark ? 'rgba(254,215,170,0.08)' : 'rgba(194,65,12,0.06)',
    borderColor: isDark ? 'rgba(254,215,170,0.12)' : 'rgba(194,65,12,0.12)',
    activeColor: isDark ? '#6EE7B7' : '#059669',
    typeIcon: 'paw-outline',
    typeLabel: 'PET',
    headerVariant: 'centered',
    identifierVariant: 'name-lg',
    identifierFontSize: 24,
    callLabel: 'Call Owner',
    callSublabel: 'Private Number',
    waLabel: 'WhatsApp Owner',
    waSublabel: 'Masked Chat',
    cardRadius: R['2xl'],
    btnRadius: R.xl,
    paws: [
      { top: 20, left: 20, size: 120, rotation: '-15deg', opacity: 0.8 },
      { top: 80, right: 10, size: 90, rotation: '25deg', opacity: 0.7 },
      { bottom: 140, left: 10, size: 160, rotation: '-35deg', opacity: 0.6 },
      { bottom: 40, right: 40, size: 100, rotation: '15deg', opacity: 0.7 },
    ],

  };
}

// ─── Animated Pet Background ──────────────────────────────────────────────────

interface PetParticle {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  size: number;
  baseRotation: number;
  opacity: number;
  type: 'paw' | 'heart' | 'bone' | 'star';
  floatRange: number;   // px up/down
  duration: number;     // ms for one float cycle
  delay: number;        // ms stagger
  rotateDeg: number;    // max extra rotate degrees on float
}

const PET_PARTICLES: PetParticle[] = [
  // large bg paws
  { top: 12, left: -8, size: 72, baseRotation: -18, opacity: 0.13, type: 'paw', floatRange: 6, duration: 4200, delay: 0, rotateDeg: 4 },
  { top: 55, right: -6, size: 54, baseRotation: 28, opacity: 0.11, type: 'paw', floatRange: 8, duration: 3800, delay: 600, rotateDeg: 5 },
  { bottom: 130, left: -4, size: 80, baseRotation: -38, opacity: 0.10, type: 'paw', floatRange: 7, duration: 5100, delay: 300, rotateDeg: 3 },
  { bottom: 35, right: 28, size: 60, baseRotation: 18, opacity: 0.12, type: 'paw', floatRange: 9, duration: 4600, delay: 900, rotateDeg: 6 },
  // mid paws
  { top: 140, left: 45, size: 36, baseRotation: 10, opacity: 0.14, type: 'paw', floatRange: 10, duration: 3500, delay: 200, rotateDeg: 7 },
  { top: 90, right: 55, size: 30, baseRotation: -22, opacity: 0.13, type: 'paw', floatRange: 12, duration: 4000, delay: 750, rotateDeg: 8 },
  // hearts
  { top: 22, right: 48, size: 18, baseRotation: 0, opacity: 0.22, type: 'heart', floatRange: 14, duration: 3200, delay: 100, rotateDeg: 0 },
  { bottom: 185, right: 65, size: 14, baseRotation: 0, opacity: 0.20, type: 'heart', floatRange: 16, duration: 2900, delay: 500, rotateDeg: 0 },
  { bottom: 80, left: 55, size: 12, baseRotation: 0, opacity: 0.18, type: 'heart', floatRange: 12, duration: 3600, delay: 800, rotateDeg: 0 },
  // bones
  { top: 180, right: 12, size: 22, baseRotation: 45, opacity: 0.15, type: 'bone', floatRange: 10, duration: 4400, delay: 350, rotateDeg: 6 },
  { bottom: 220, left: 30, size: 18, baseRotation: -30, opacity: 0.13, type: 'bone', floatRange: 8, duration: 3900, delay: 650, rotateDeg: 5 },
  // sparkle stars
  { top: 70, left: 28, size: 12, baseRotation: 0, opacity: 0.25, type: 'star', floatRange: 8, duration: 2800, delay: 420, rotateDeg: 20 },
  { bottom: 150, right: 20, size: 10, baseRotation: 0, opacity: 0.22, type: 'star', floatRange: 10, duration: 3100, delay: 720, rotateDeg: 25 },
];

const PARTICLE_ICON: Record<PetParticle['type'], string> = {
  paw: 'paw',
  heart: 'heart',
  bone: 'bone',     // Ionicons doesn't have bone — we'll handle fallback
  star: 'sparkles',
};

const FloatingParticle = memo(({
  particle, color,
}: {
  particle: PetParticle;
  color: string;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Staggered entrance fade-in
    const entranceTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: particle.opacity,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 4,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start the continuous float loop after entrance
        const floatLoop = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: -particle.floatRange,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: particle.rotateDeg,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: particle.opacity * 0.65,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: particle.floatRange * 0.4,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: -particle.rotateDeg * 0.5,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: particle.opacity,
                duration: particle.duration / 2,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        floatLoop.start();
      });
    }, particle.delay);

    return () => clearTimeout(entranceTimer);
  }, []);

  const rotateInterp = rotate.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  const iconName = particle.type === 'bone' ? 'barbell-outline'
    : particle.type === 'star' ? 'sparkles-outline'
      : particle.type === 'heart' ? 'heart'
        : 'paw';

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: particle.top,
        left: particle.left,
        right: particle.right,
        bottom: particle.bottom,
        opacity,
        transform: [
          { translateY },
          { rotate: rotateInterp },
          { scale },
          { rotate: `${particle.baseRotation}deg` },
        ],
      }}
    >
      <Ionicons
        name={iconName as any}
        size={particle.size}
        color={particle.type === 'heart' ? '#FF6B8A' : particle.type === 'star' ? '#FFD700' : color}
      />
    </Animated.View>
  );
});

export const AnimatedPetBackground = memo(({ color }: { color: string }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {PET_PARTICLES.map((p, i) => (
      <FloatingParticle key={i} particle={p} color={color} />
    ))}
  </View>
));

/** @deprecated Use AnimatedPetBackground instead */
export const DecorationPaws = memo(({ paws, color }: { paws: Required<TypeConfig>['paws']; color: string }) => (
  <AnimatedPetBackground color={color} />
));

// ─── Pulsing Dot ─────────────────────────────────────────────────────────────

export const PulsingDot = memo(({ color }: { color: string }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.25, duration: 950, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 950, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: anim }}
    />
  );
});

// ─── Status Badge ─────────────────────────────────────────────────────────────

export const StatusBadge = memo(({
  isActive, activeColor, accentMuted, borderColor,
}: {
  isActive: boolean; activeColor: string; accentMuted: string; borderColor: string;
}) => (
  <View style={[
    sharedS.statusBadge,
    {
      backgroundColor: isActive ? activeColor + '18' : 'rgba(255,255,255,0.07)',
      borderColor: isActive ? activeColor + '40' : borderColor,
    },
  ]}>
    {isActive
      ? <PulsingDot color={activeColor} />
      : <View style={[sharedS.staticDot, { backgroundColor: accentMuted }]} />}
    <Text style={[sharedS.statusText, { color: isActive ? activeColor : accentMuted }]}>
      {isActive ? 'Active' : 'Inactive'}
    </Text>
  </View>
));

// ─── Tag Card Header ──────────────────────────────────────────────────────────

export const TagCardHeader = memo(({ tag, config }: { tag: Tag; config: TypeConfig }) => {
  const { typeIcon, typeLabel, accent, accentMuted, accentFrost, borderColor, activeColor, domain } = config;

  if (config.headerVariant === 'compact') {
    return (
      <View style={sharedS.headerRow}>
        <View style={[sharedS.iconChip, { backgroundColor: accentFrost, borderColor }]}>
          <Ionicons name={typeIcon as any} size={16} color={accent} />
        </View>
        <View style={sharedS.headerMeta}>
          <Text style={[sharedS.headerNickname, { color: accent }]} numberOfLines={1}>
            {tag.nickname}
          </Text>
          <Text style={[sharedS.headerTypeLabel, { color: accentMuted }]}>{typeLabel}</Text>
        </View>
        <StatusBadge isActive={tag.isActive} activeColor={activeColor} accentMuted={accentMuted} borderColor={borderColor} />
      </View>
    );
  }

  const iconSize = domain === 'KID' ? 28 : 24;
  const chipSize = domain === 'KID' ? 52 : 46;
  const chipRadius = domain === 'KID' ? R['2xl'] : R.xl;

  return (
    <View style={sharedS.headerCentered}>
      <View style={[sharedS.iconChipLg, { width: chipSize, height: chipSize, borderRadius: chipRadius, backgroundColor: accentFrost, borderColor }]}>
        <Ionicons name={typeIcon as any} size={iconSize} color={accent} />
      </View>
      <View style={sharedS.headerCenterMeta}>
        <Text style={[sharedS.headerNameLg, { color: accent }]} numberOfLines={1}>{tag.nickname}</Text>
        <Text style={[sharedS.headerTypeLabel, { color: accentMuted }]}>{typeLabel}</Text>
      </View>
      <StatusBadge isActive={tag.isActive} activeColor={activeColor} accentMuted={accentMuted} borderColor={borderColor} />
    </View>
  );
});

// ─── Tag Card Identifier ──────────────────────────────────────────────────────

export const TagCardIdentifier = memo(({ tag, config }: { tag: Tag; config: TypeConfig }) => {
  const { accent, accentMuted, accentFrost, borderColor, domain } = config;

  const displayText = (
    tag.config?.plateNumber ||
    tag.config?.displayName ||
    tag.config?.petName ||
    tag.plateNumber ||
    tag.code
  );

  if (config.identifierVariant === 'plate') {
    return (
      <View style={[sharedS.plateFrame, { borderColor, backgroundColor: accentFrost }]}>
        <View style={sharedS.plateInner}>
          <View style={[sharedS.plateDot, { backgroundColor: accentMuted }]} />
          <Text
            style={[sharedS.plateText, { color: accent, fontSize: config.identifierFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayText.toUpperCase()}
          </Text>
          <View style={[sharedS.plateDot, { backgroundColor: accentMuted }]} />
        </View>
        <Text style={[sharedS.plateCaption, { color: accentMuted }]}>LICENSE PLATE</Text>
      </View>
    );
  }

  const emoji = domain === 'KID' ? '🧒' : '🐾';

  return (
    <View style={[
      sharedS.namePlateFrame,
      { borderColor, backgroundColor: accentFrost, borderRadius: domain === 'KID' ? R.xl : R.lg },
    ]}>
      <Text style={sharedS.namePlateEmoji}>{emoji}</Text>
      <Text
        style={[sharedS.namePlateText, { color: accent, fontSize: config.identifierFontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayText}
      </Text>
    </View>
  );
});

// ─── Tag Card Meta Row ────────────────────────────────────────────────────────

export const TagCardMeta = memo(({ scanCount, config }: { scanCount: number; config: TypeConfig }) => {
  const { accentMuted, accentFrost } = config;
  return (
    <View style={sharedS.meta}>
      <View style={[sharedS.scanChip, { backgroundColor: accentFrost }]}>
        <Ionicons name="scan-outline" size={11} color={accentMuted} />
        <Text style={[sharedS.scanText, { color: accentMuted }]}>
          {scanCount} {scanCount === 1 ? 'scan' : 'scans'}
        </Text>
      </View>
      <Text style={[sharedS.metaType, { color: accentMuted }]}>{config.typeLabel}</Text>
    </View>
  );
});

// ─── Icon Glow Ring ───────────────────────────────────────────────────────────
/**
 * Soft ambient glow behind the icon when button is active.
 * Uses opacity loop — native driver, zero JS overhead.
 */
const IconGlowRing = memo(({ color, size }: { color: string; size: number }) => {
  const anim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
        backgroundColor: color,
        opacity: anim,
      }}
    />
  );
});

// ─── Primary Communication Button ─────────────────────────────────────────────
/**
 * The main action tile — completely rebuilt from v3.
 *
 * Layout: centered icon + label + sublabel pill
 * Active: rich gradient + icon glow ring + animated border glow + shine bar
 * Inactive: frosted glass + explicit "Disabled" state + muted palette
 */
export const PrimaryCommButton = memo(({
  icon, label, sublabel,
  gradientColors, glowColor, iconGlowColor,
  active, onToggle,
  borderColor, accentFrost, accentMuted,
  borderRadius = R.lg,
}: {
  icon: string;
  label: string;
  sublabel: string;
  gradientColors: readonly [string, string, string];
  glowColor: string;
  iconGlowColor: string;
  active: boolean;
  onToggle: () => void;
  borderColor: string;
  accentFrost: string;
  accentMuted: string;
  borderRadius?: number;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Glow border spring on active change
  useEffect(() => {
    Animated.spring(glowAnim, {
      toValue: active ? 1 : 0,
      useNativeDriver: false,
      ...MOTION.glowSpring,
    }).start();
  }, [active]);

  // Shine shimmer on mount (active only) — subtle sweep down
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.delay(1600),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: MOTION.btnScale,
      useNativeDriver: true,
      speed: MOTION.btnPress.speed,
      bounciness: MOTION.btnPress.bounciness,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: MOTION.btnPress.bounceBack.speed,
      bounciness: MOTION.btnPress.bounceBack.bounciness,
    }).start();
    onToggle();
  }, [onToggle]);

  const glowBorder = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', glowColor],
  });

  // Shimmer strip translateY: top → bottom of button
  const shimmerY = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 140],
  });

  const ICON_SIZE = 52;
  const ICON_INNER = 26;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={btnS.pressable}
      accessibilityRole="switch"
      accessibilityLabel={`${label} ${active ? 'enabled' : 'disabled'}`}
      accessibilityState={{ checked: active }}
      accessibilityHint={`Double-tap to ${active ? 'disable' : 'enable'}`}
    >
      <Animated.View style={[btnS.root, { transform: [{ scale }] }]}>

        {/* ── Background Layer Wrapper (Hidden Overflow) ── */}
        <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
          {/* Active: gradient fill */}
          {active && (
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Inactive: frosted glass */}
          {!active && (
            <View style={[StyleSheet.absoluteFill, btnS.frosted, { backgroundColor: accentFrost, borderColor }]} />
          )}

          {/* Shine bar at top — glass depth */}
          {active && (
            <View style={btnS.shineBar} pointerEvents="none" />
          )}

          {/* Shimmer sweep */}
          {active && (
            <Animated.View
              style={[btnS.shimmerStrip, { transform: [{ translateY: shimmerY }, { rotate: '-12deg' }] }]}
              pointerEvents="none"
            />
          )}
        </View>

        {/* ── Animated glow border ── */}
        <Animated.View style={[StyleSheet.absoluteFill, btnS.glowRing, { borderColor: glowBorder, borderRadius }]} />

        {/* ── Central content ── */}
        <View style={btnS.content}>

          {/* Icon circle */}
          <View style={[btnS.iconCircle, { width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2 }]}>
            <View style={[
              btnS.iconInner,
              {
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: ICON_SIZE / 2,
                backgroundColor: active
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(255,255,255,0.06)',
                borderColor: active
                  ? 'rgba(255,255,255,0.28)'
                  : borderColor,
              },
            ]}>
              <Ionicons
                name={icon as any}
                size={ICON_INNER}
                color={active ? '#FFF' : accentMuted}
              />
            </View>
          </View>

          {/* Label */}
          <Text
            style={[
              btnS.label,
              { color: active ? '#FFF' : accentMuted },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>

          {/* Sublabel pill */}
          <View style={[
            btnS.sublabelPill,
            {
              backgroundColor: active
                ? 'rgba(255,255,255,0.14)'
                : 'rgba(255,255,255,0.05)',
              borderColor: active
                ? 'rgba(255,255,255,0.2)'
                : borderColor,
            },
          ]}>
            <Ionicons
              name="shield-checkmark"
              size={9}
              color={active ? 'rgba(255,255,255,0.9)' : accentMuted}
            />
            <Text
              style={[
                btnS.sublabelText,
                {
                  color: active ? 'rgba(255,255,255,0.9)' : accentMuted,
                  opacity: active ? 1 : 0.55,
                },
              ]}
              numberOfLines={1}
            >
              {sublabel}
            </Text>
          </View>

        </View>
      </Animated.View>
    </Pressable>
  );
});

export const btnS = StyleSheet.create({
  pressable: {
    flex: 1,
    minHeight: 118,
  },
  root: {
    flex: 1,
    overflow: 'visible',
    minHeight: 118,
    // Center content vertically
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  frosted: {
    borderWidth: 1,
  },
  glowRing: {
    borderWidth: 1.5,
  },
  // Thin white gradient lip at top — creates glass depth
  shineBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Diagonal shimmer sweep
  shimmerStrip: {
    position: 'absolute',
    left: -60,
    width: 40,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  offBadge: {
    position: 'absolute', top: sp(1), right: sp(1),
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: R.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  offText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
  },
  content: {
    alignItems: 'center',
    gap: 7,
    paddingVertical: sp(2),
    paddingHorizontal: sp(1.5),
  },
  // Container that holds both the glow ring and the icon inner
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  // The actual visible circle behind the icon
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sublabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sublabelText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

// ─── SMS Toggle Row ───────────────────────────────────────────────────────────

export const SmsToggleRow = memo(({
  active, onToggle, borderColor, accentFrost, accentMuted, isDark, borderRadius = R.md,
}: {
  active: boolean; onToggle: () => void;
  borderColor: string; accentFrost: string; accentMuted: string; isDark: boolean;
  borderRadius?: number;
}) => {
  const thumbX = useRef(new Animated.Value(active ? TRAVEL : 2)).current;
  const trackBg = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(thumbX, {
        toValue: active ? TRAVEL : 2,
        useNativeDriver: true,
        speed: MOTION.toggleSpring.speed,
        bounciness: MOTION.toggleSpring.bounciness,
      }),
      Animated.timing(trackBg, { toValue: active ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [active]);

  const trackColor = trackBg.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)', COMM.sms],
  });

  return (
    <Pressable
      onPress={onToggle}
      style={[smsS.row, { backgroundColor: accentFrost, borderColor, borderRadius, borderWidth: StyleSheet.hairlineWidth }]}
      accessibilityRole="switch"
      accessibilityLabel={`SMS ${active ? 'enabled' : 'disabled'}`}
      accessibilityState={{ checked: active }}
    >
      <View style={[smsS.iconWrap, { backgroundColor: active ? COMM.smsBg : 'transparent' }]}>
        <Ionicons name="chatbubble-ellipses" size={16} color={active ? COMM.sms : accentMuted} />
      </View>
      <View style={smsS.meta}>
        <Text style={[smsS.label, { color: active ? COMM.sms : accentMuted }]}>SMS</Text>
        <Text style={[smsS.sublabel, { color: accentMuted }]}>Text message</Text>
      </View>
      <Animated.View style={[smsS.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[smsS.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </Pressable>
  );
});

export const smsS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: sp(1.25), paddingHorizontal: sp(1.5),
    paddingVertical: sp(1.25), minHeight: 52,
  },
  iconWrap: { width: 32, height: 32, borderRadius: R.sm, justifyContent: 'center', alignItems: 'center' },
  meta: { flex: 1, gap: 2 },
  label: { fontSize: 14, fontWeight: '700' },
  sublabel: { fontSize: 11, fontWeight: '500', opacity: 0.65 },
  track: { width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2, justifyContent: 'center' },
  thumb: {
    position: 'absolute', width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2, backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
});

// ─── Kids Safety Banner ───────────────────────────────────────────────────────

export const kidsS = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: sp(1.5), paddingVertical: sp(1),
  },
  bannerText: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 15, opacity: 0.85 },
});

export const petS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: sp(1.5), paddingVertical: sp(1),
  },
  petEmoji: { fontSize: 18 },
  text: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 15, opacity: 0.85 },
});

// ─── Shared Styles ────────────────────────────────────────────────────────────

export const sharedS = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: sp(1) },
  iconChip: {
    width: 36, height: 36, borderRadius: R.md,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center', alignItems: 'center',
  },
  headerMeta: { flex: 1, gap: 1 },
  headerNickname: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  headerTypeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  headerCentered: { flexDirection: 'row', alignItems: 'center', gap: sp(1.25) },
  iconChipLg: { borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  headerCenterMeta: { flex: 1, gap: 2 },
  headerNameLg: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: sp(1.25), paddingVertical: 4,
    borderRadius: R.full, borderWidth: StyleSheet.hairlineWidth,
  },
  staticDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  plateFrame: {
    borderRadius: R.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: sp(1.5), paddingVertical: sp(1),
  },
  plateInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  plateDot: { width: 5, height: 5, borderRadius: 3 },
  plateText: { fontWeight: '800', letterSpacing: 2.5, includeFontPadding: false, textAlign: 'center' },
  plateCaption: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginTop: 2, textTransform: 'uppercase', opacity: 0.6 },
  namePlateFrame: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: sp(2), paddingVertical: sp(1.25),
    flexDirection: 'row', alignItems: 'center', gap: sp(1),
  },
  namePlateEmoji: { fontSize: 22 },
  namePlateText: { flex: 1, fontWeight: '800', letterSpacing: 0.5, includeFontPadding: false },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: sp(1), paddingVertical: 3, borderRadius: R.full },
  scanText: { fontSize: 11, fontWeight: '600' },
  metaType: { fontSize: 9, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  divider: { height: StyleSheet.hairlineWidth },
  primaryRow: { flexDirection: 'row', gap: sp(1.5) },
});