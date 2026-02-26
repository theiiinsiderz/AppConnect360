/**
 * PublicScanScreen — Elite Multi-Domain Redesign v2
 *
 * ─── What changed from v1 ─────────────────────────────────────────────────────
 *
 *  v1 had one shared activation flow that was generically themed.
 *  The domain type (CAR / KID / PET) was known immediately after tag load,
 *  but the entire activation experience remained identical across types.
 *
 *  v2 makes the ENTIRE screen domain-aware from first render:
 *
 *    CAR  → "Slate & Amber" — precise, professional, license-plate-hero
 *    KID  → "Sky & Sunrise" — safe, rounded, parental warmth, guardian framing
 *    PET  → "Terracotta & Cream" — organic, warm, joyful, companion framing
 *
 *  Architecture:
 *    ┌─ getDomainConfig(domain, isDark) → DomainConfig
 *    │     Single source of truth for all domain-specific tokens + copy.
 *    │
 *    ├─ DomainShell
 *    │     Gradient background + safe-area — shared across all states.
 *    │
 *    ├─ DomainHeader
 *    │     Brand wordmark + tagline adapt per domain.
 *    │
 *    ├─ DomainLoadingSkeleton
 *    │     Skeleton shape matches final layout: plate for CAR, round avatar for KID/PET.
 *    │
 *    ├─ DomainErrorState
 *    │     Error tone: cold/informational for CAR, warm/reassuring for KID/PET.
 *    │
 *    ├─ ActivationFlow (extracted)
 *    │     Receives DomainConfig — all copy, colors, icons injected.
 *    │     Steps: Phone → OTP → Identifier (plate / child name / pet name)
 *    │
 *    └─ ActivationSuccess
 *          Domain-specific celebration state.
 *
 *  Zero breaking changes:
 *    • All store calls (activateTagSendOtp, activateTagVerifyOtp) — unchanged.
 *    • All router calls — unchanged.
 *    • useAuthStore.setState — unchanged.
 *    • CarScanView / KidScanView / PetScanView routing — unchanged.
 *    • All existing state variables and handlers — unchanged.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { CarScanView } from '../../components/domains/CarScanView';
import { KidScanView } from '../../components/domains/KidScanView';
import { PetScanView } from '../../components/domains/PetScanView';
import { useAuthStore } from '../../store/authStore';
import { useTagStore } from '../../store/tagStore';
import { CarTheme, KidTheme, PetTheme } from '../../theme/domainThemes';
import { useAppTheme } from '../../theme/theme';

// ─── Design Tokens — Shared ───────────────────────────────────────────────────

const U = 8;
const sp = (n: number) => U * n;

const R = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 28,
    '3xl': 36,
    full: 9999,
} as const;

const SHADOW = {
    sm: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
        android: { elevation: 2 },
    }),
    md: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14 },
        android: { elevation: 5 },
    }),
    lg: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 28 },
        android: { elevation: 10 },
    }),
};

// ─── Domain Config ────────────────────────────────────────────────────────────

type DomainType = 'CAR' | 'KID' | 'PET';

interface DomainConfig {
    domain: DomainType;

    // Shell gradient (3 stops)
    bgGrad: readonly [string, string, string];

    // Card surface
    card: string;
    cardBorder: string;

    // Typography
    text: string;
    subtext: string;
    muted: string;

    // Brand
    primary: string;
    primaryGlow: string;
    primaryFrost: string;

    // CTA gradient (call button)
    ctaGrad: readonly [string, string, string];

    // States
    danger: string;
    dangerBg: string;
    successColor: string;
    successBg: string;

    // Skeleton
    skeleton: string;

    // Divider
    divider: string;

    // Branding copy
    brandName: string;
    brandTagline: string;

    // Activation copy
    activationTitle: string;
    activationSub: (code: string) => string;
    stepLabels: [string, string, string];
    identifierLabel: string;
    identifierPlaceholder: string;
    identifierAutoCapitalize: 'characters' | 'words' | 'none';

    // Icon
    domainIcon: string;

    // Card radius
    cardRadius: number;

    // Error copy
    errorTitle: string;
    errorSub: string;

    // Success copy
    successTitle: string;
    successSub: string;
    successEmoji: string;
}

function getDomainConfig(domain: DomainType, isDark: boolean): DomainConfig {
    // ── Vehicle ──────────────────────────────────────────────────────────────────
    if (domain === 'CAR') {
        const primary = '#FACC15'; // Warning Yellow
        return {
            domain,
            bgGrad: isDark
                ? ['#000000', '#09090B', '#111827']
                : ['#FFFBEB', '#FEF3C7', '#FDE68A'],
            card: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
            cardBorder: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(234, 179, 8, 0.2)',
            text: isDark ? '#FFFFFF' : '#000000',
            subtext: isDark ? 'rgba(250, 204, 21, 0.8)' : 'rgba(161, 98, 7, 0.8)',
            muted: isDark ? 'rgba(250, 204, 21, 0.4)' : 'rgba(161, 98, 7, 0.5)',
            primary,
            primaryGlow: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.15)',
            primaryFrost: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(250, 204, 21, 0.05)',
            ctaGrad: ['#F59E0B', '#FACC15', '#FDE68A'],
            danger: '#EF4444',
            dangerBg: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)',
            successColor: '#10B981',
            successBg: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            skeleton: isDark ? '#1F2937' : '#E5E7EB',
            divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            brandName: 'Connect 360',
            brandTagline: 'SMART CONNECTIONS',
            activationTitle: 'Claim Your Vehicle Tag',
            activationSub: (code) => `Tag ${code} is ready to be registered.`,
            stepLabels: ['Phone', 'Verify', 'Vehicle'],
            identifierLabel: 'Vehicle / Plate Number',
            identifierPlaceholder: 'MH01AB1234',
            identifierAutoCapitalize: 'characters',
            domainIcon: 'car-sport',
            cardRadius: R['2xl'],
            errorTitle: 'Tag Not Found',
            errorSub: 'This tag may be inactive or doesn\'t exist. Try scanning again.',
            successTitle: 'Vehicle Tag Activated',
            successSub: 'Your tag is now linked to your account and ready to go.',
            successEmoji: '🚕',
        };
    }

    // ── Kids ──────────────────────────────────────────────────────────────────────
    if (domain === 'KID') {
        return {
            domain,
            bgGrad: isDark
                ? ['#0C1445', '#0F2060', '#1A3070']
                : ['#EFF6FF', '#DBEAFE', '#E0F2FE'],
            card: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.88)',
            cardBorder: isDark ? 'rgba(186,230,253,0.12)' : 'rgba(147,197,253,0.5)',
            text: isDark ? '#BAE6FD' : '#1E3A5F',
            subtext: isDark ? '#7DD3FC' : '#3B82F6',
            muted: isDark ? '#38BDF8' : '#93C5FD',
            primary: isDark ? '#38BDF8' : '#2563EB',
            primaryGlow: isDark ? 'rgba(56,189,248,0.2)' : 'rgba(37,99,235,0.14)',
            primaryFrost: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.06)',
            ctaGrad: ['#1D4ED8', '#2563EB', '#3B82F6'],
            danger: isDark ? '#FCA5A5' : '#DC2626',
            dangerBg: isDark ? 'rgba(252,165,165,0.10)' : 'rgba(220,38,38,0.07)',
            successColor: isDark ? '#6EE7B7' : '#059669',
            successBg: isDark ? 'rgba(110,231,183,0.10)' : 'rgba(5,150,105,0.08)',
            skeleton: isDark ? '#1E3A5F' : '#BFDBFE',
            divider: isDark ? 'rgba(186,230,253,0.1)' : 'rgba(37,99,235,0.1)',
            brandName: 'SafeTag',
            brandTagline: 'CHILD SAFETY NETWORK',
            activationTitle: 'Set Up Your Child\'s Safety Tag',
            activationSub: (code) => `Tag ${code} will protect your little one.`,
            stepLabels: ['Phone', 'Verify', 'Child'],
            identifierLabel: "Child's Name",
            identifierPlaceholder: 'Enter full name',
            identifierAutoCapitalize: 'words',
            domainIcon: 'happy-outline',
            cardRadius: R['3xl'],
            errorTitle: "Tag Not Available",
            errorSub: "We couldn't find this tag. Please check the code and try again.",
            successTitle: 'Safety Tag Activated! 🎉',
            successSub: "Your child's tag is active and will help them get home safely.",
            successEmoji: '🧒',
        };
    }

    // ── Pets ───────────────────────────────────────────────────────────────────────
    return {
        domain: 'PET',
        bgGrad: isDark
            ? ['#1C0A00', '#3D1500', '#7C2D12']
            : ['#FFF7ED', '#FFEDD5', '#FEF3C7'],
        card: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
        cardBorder: isDark ? 'rgba(254,215,170,0.12)' : 'rgba(245,158,11,0.25)',
        text: isDark ? '#FED7AA' : '#1C0A00',
        subtext: isDark ? '#FCA5A5' : '#92400E',
        muted: isDark ? '#FDBA74' : '#D97706',
        primary: isDark ? '#FBBF24' : '#D97706',
        primaryGlow: isDark ? 'rgba(251,191,36,0.2)' : 'rgba(217,119,6,0.14)',
        primaryFrost: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(217,119,6,0.07)',
        ctaGrad: ['#92400E', '#C2410C', '#EA580C'],
        danger: isDark ? '#FCA5A5' : '#DC2626',
        dangerBg: isDark ? 'rgba(252,165,165,0.10)' : 'rgba(220,38,38,0.07)',
        successColor: isDark ? '#6EE7B7' : '#16A34A',
        successBg: isDark ? 'rgba(110,231,183,0.10)' : 'rgba(22,163,74,0.08)',
        skeleton: isDark ? '#3D1500' : '#FED7AA',
        divider: isDark ? 'rgba(254,215,170,0.1)' : 'rgba(217,119,6,0.12)',
        brandName: 'PawTag',
        brandTagline: 'PET IDENTITY & SAFETY',
        activationTitle: 'Register Your Pet\'s Tag',
        activationSub: (code) => `Tag ${code} will help your pet find their way home.`,
        stepLabels: ['Phone', 'Verify', 'Pet'],
        identifierLabel: 'Pet Name',
        identifierPlaceholder: 'Enter your pet\'s name',
        identifierAutoCapitalize: 'words',
        domainIcon: 'paw-outline',
        cardRadius: R['3xl'],
        errorTitle: "Tag Not Found",
        errorSub: "This tag doesn't seem to be registered. Please try scanning again.",
        successTitle: 'Pet Tag Activated! 🐾',
        successSub: "Your pet's tag is live. They're always a scan away from home.",
        successEmoji: '🐾',
    };
}

// ─── Utility: useFadeUp ───────────────────────────────────────────────────────

function useFadeUp(delay = 0, distance = 20) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        const anim = Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
            Animated.spring(translateY, {
                toValue: 0, delay, speed: 16, bounciness: 5, useNativeDriver: true,
            }),
        ]);
        anim.start();
        return () => anim.stop();
    }, []);

    return { opacity, transform: [{ translateY }] };
}

// ─── Domain Shell ─────────────────────────────────────────────────────────────
/** Gradient background wrapper — shared across all states */

function DomainShell({
    cfg,
    children,
    style,
}: {
    cfg: DomainConfig;
    children: React.ReactNode;
    style?: object;
}) {
    return (
        <LinearGradient
            colors={cfg.bgGrad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[shellS.root, style]}
        >
            {/* Ambient Background Pattern */}
            {cfg.domain === 'CAR' ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <View style={[shellS.slash, { top: -20, right: 40, width: 220, opacity: 0.15, backgroundColor: cfg.primary }]} />
                    <View style={[shellS.slash, { top: 140, right: -10, width: 260, opacity: 0.08, backgroundColor: cfg.primary }]} />
                    <View style={[shellS.slash, { bottom: 200, left: -20, width: 300, opacity: 0.05, backgroundColor: cfg.primary }]} />
                    <View style={[shellS.slash, { bottom: 340, left: 20, width: 180, opacity: 0.1, backgroundColor: cfg.primary }]} />
                </View>
            ) : (
                <>
                    <View style={[shellS.orb1, { backgroundColor: cfg.primaryGlow }]} />
                    <View style={[shellS.orb2, { backgroundColor: cfg.primaryGlow }]} />
                </>
            )}
            {children}
        </LinearGradient>
    );
}

const shellS = StyleSheet.create({
    root: { flex: 1 },
    orb1: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        top: -100, right: -80,
    },
    orb2: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        bottom: 60, left: -60,
    },
    slash: {
        position: 'absolute',
        height: 1,
        transform: [{ rotate: '-35deg' }],
    },
});

// ─── Domain Header ────────────────────────────────────────────────────────────

function DomainHeader({ cfg, paddingTop }: { cfg: DomainConfig; paddingTop: number }) {
    const style = useFadeUp(0);

    return (
        <Animated.View style={[headerS.root, { paddingTop: paddingTop + sp(2) }, style]}>
            <View style={[headerS.iconChip, { backgroundColor: cfg.primaryFrost, borderColor: cfg.primary + '30' }]}>
                <Ionicons name={cfg.domainIcon as any} size={18} color={cfg.primary} />
            </View>
            <View style={headerS.text}>
                <Text style={[headerS.brand, { color: cfg.primary }]}>{cfg.brandName}</Text>
                <Text style={[headerS.tagline, { color: cfg.muted }]}>{cfg.brandTagline}</Text>
            </View>
        </Animated.View>
    );
}

const headerS = StyleSheet.create({
    root: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: sp(3), paddingBottom: sp(2.5),
        gap: sp(1.5),
    },
    iconChip: {
        width: 38, height: 38, borderRadius: R.md,
        borderWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center', alignItems: 'center',
    },
    text: { gap: 1 },
    brand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    tagline: {
        fontSize: 9, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase',
    },
});

// ─── Domain Loading Skeleton ──────────────────────────────────────────────────
/**
 * Shape-matches the final layout per domain:
 *   CAR  → rectangular plate-shaped skeleton
 *   KID  → circular avatar + tall rounded blocks
 *   PET  → circular avatar + organic rounded blocks
 */

function SkeletonPulse({ width, height, borderRadius = R.md, color }: {
    width: number | string; height: number; borderRadius?: number; color: string;
}) {
    const anim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View style={{
            width: width as any, height, borderRadius,
            backgroundColor: color, opacity: anim,
        }} />
    );
}

function DomainLoadingSkeleton({ cfg }: { cfg: DomainConfig }) {
    const isVehicle = cfg.domain === 'CAR';
    const avatarRadius = isVehicle ? R.lg : R.full;
    const avatarSize = isVehicle ? undefined : 80;

    return (
        <View style={[skeletonS.card, {
            backgroundColor: cfg.card,
            borderColor: cfg.cardBorder,
            borderRadius: cfg.cardRadius,
        }]}>
            {/* Avatar or plate placeholder */}
            {isVehicle ? (
                <View style={skeletonS.plateWrap}>
                    <SkeletonPulse width="80%" height={60} borderRadius={R.lg} color={cfg.skeleton} />
                    <SkeletonPulse width={100} height={14} borderRadius={R.full} color={cfg.skeleton} />
                </View>
            ) : (
                <View style={skeletonS.avatarWrap}>
                    <SkeletonPulse width={80} height={80} borderRadius={R.full} color={cfg.skeleton} />
                </View>
            )}

            <SkeletonPulse width="60%" height={24} borderRadius={R.sm} color={cfg.skeleton} />
            <SkeletonPulse width="40%" height={16} borderRadius={R.sm} color={cfg.skeleton} />

            <View style={[skeletonS.divider, { backgroundColor: cfg.divider }]} />

            <SkeletonPulse width="100%" height={56} borderRadius={R.lg} color={cfg.skeleton} />
            <SkeletonPulse width="100%" height={56} borderRadius={R.lg} color={cfg.skeleton} />
        </View>
    );
}

const skeletonS = StyleSheet.create({
    card: {
        borderWidth: StyleSheet.hairlineWidth,
        padding: sp(3.5),
        alignItems: 'center',
        gap: sp(1.5),
        ...SHADOW.md,
    },
    plateWrap: { alignItems: 'center', gap: 8, marginBottom: sp(1), width: '100%' },
    avatarWrap: { marginBottom: sp(1.5) },
    divider: { width: '100%', height: StyleSheet.hairlineWidth, marginVertical: sp(2) },
});

// ─── Domain Error State ───────────────────────────────────────────────────────

function DomainErrorState({
    cfg, onRetry, insetTop,
}: {
    cfg: DomainConfig; onRetry: () => void; insetTop: number;
}) {
    const style = useFadeUp(100);

    return (
        <DomainShell cfg={cfg}>
            <Animated.View style={[errS.root, { paddingTop: insetTop + sp(6) }, style]}>
                <View style={[errS.iconWrap, { backgroundColor: cfg.dangerBg, borderColor: cfg.danger + '30' }]}>
                    <Ionicons
                        name={cfg.domain === 'CAR' ? 'alert-circle-outline' : cfg.domain === 'KID' ? 'shield-outline' : 'paw-outline'}
                        size={44}
                        color={cfg.danger}
                    />
                </View>
                <Text style={[errS.title, { color: cfg.text }]}>{cfg.errorTitle}</Text>
                <Text style={[errS.sub, { color: cfg.subtext }]}>{cfg.errorSub}</Text>
                <Pressable
                    onPress={onRetry}
                    style={[errS.btn, { backgroundColor: cfg.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel="Go home"
                >
                    <Text style={errS.btnText}>Go Home</Text>
                </Pressable>
            </Animated.View>
        </DomainShell>
    );
}

const errS = StyleSheet.create({
    root: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: sp(4.5), gap: sp(1.5),
    },
    iconWrap: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 1,
        justifyContent: 'center', alignItems: 'center', marginBottom: sp(1),
    },
    title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
    sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.8 },
    btn: {
        marginTop: sp(2), paddingHorizontal: sp(5), paddingVertical: sp(2),
        borderRadius: R['2xl'], minWidth: 200, alignItems: 'center', ...SHADOW.md,
    },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});

// ─── Activation Success State ─────────────────────────────────────────────────

function ActivationSuccess({
    cfg, onContinue, insetTop,
}: {
    cfg: DomainConfig; onContinue: () => void; insetTop: number;
}) {
    const style = useFadeUp(80);
    // Bouncing emoji animation
    const bounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.spring(bounce, { toValue: -12, useNativeDriver: true, speed: 8, bounciness: 10 }),
                Animated.spring(bounce, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 10 }),
            ])
        ).start();
    }, []);

    return (
        <DomainShell cfg={cfg}>
            <Animated.View style={[successS.root, { paddingTop: insetTop + sp(6) }, style]}>
                <Animated.Text style={[successS.emoji, { transform: [{ translateY: bounce }] }]}>
                    {cfg.successEmoji}
                </Animated.Text>
                <View style={[successS.iconWrap, { backgroundColor: cfg.successBg, borderColor: cfg.successColor + '40' }]}>
                    <Ionicons name="checkmark-circle" size={52} color={cfg.successColor} />
                </View>
                <Text style={[successS.title, { color: cfg.text }]}>{cfg.successTitle}</Text>
                <Text style={[successS.sub, { color: cfg.subtext }]}>{cfg.successSub}</Text>
                <Pressable
                    onPress={onContinue}
                    style={[successS.btn, { backgroundColor: cfg.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel="Go to dashboard"
                >
                    <Text style={successS.btnText}>Go to Dashboard</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </Pressable>
            </Animated.View>
        </DomainShell>
    );
}

const successS = StyleSheet.create({
    root: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: sp(4.5), gap: sp(1.75),
    },
    emoji: { fontSize: 52, marginBottom: sp(0.5) },
    iconWrap: {
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 1.5,
        justifyContent: 'center', alignItems: 'center', marginBottom: sp(1),
    },
    title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
    sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.82 },
    btn: {
        marginTop: sp(2), paddingHorizontal: sp(4), paddingVertical: sp(2),
        borderRadius: R['2xl'], flexDirection: 'row', alignItems: 'center',
        gap: sp(1), minWidth: 220, justifyContent: 'center', ...SHADOW.md,
    },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
    steps, current, cfg,
}: {
    steps: [string, string, string]; current: number; cfg: DomainConfig;
}) {
    return (
        <View style={stepS.root}>
            {steps.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <View key={label} style={stepS.item}>
                        <View style={[
                            stepS.dot,
                            {
                                backgroundColor: done || active ? cfg.primary : cfg.divider,
                                borderColor: active ? cfg.primary + '60' : 'transparent',
                                borderWidth: active ? 3 : 0,
                            },
                        ]}>
                            {done
                                ? <Ionicons name="checkmark" size={11} color="#FFF" />
                                : <View style={[stepS.innerDot, { backgroundColor: active ? '#FFF' : 'transparent' }]} />}
                        </View>
                        <Text style={[stepS.label, {
                            color: active ? cfg.primary : done ? cfg.subtext : cfg.muted,
                            fontWeight: active ? '700' : '500',
                        }]}>
                            {label}
                        </Text>
                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <View style={[stepS.connector, { backgroundColor: i < current ? cfg.primary : cfg.divider }]} />
                        )}
                    </View>
                );
            })}
        </View>
    );
}

const stepS = StyleSheet.create({
    root: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', marginBottom: sp(3) },
    item: { alignItems: 'center', flex: 1, position: 'relative' },
    dot: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    innerDot: { width: 8, height: 8, borderRadius: 4 },
    label: { fontSize: 11, letterSpacing: 0.2, textAlign: 'center' },
    connector: {
        position: 'absolute', top: 13, left: '60%', right: '-60%', height: 2, borderRadius: 1,
    },
});

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
    value, onChangeText, placeholder, keyboardType, maxLength,
    autoFocus, autoCapitalize, returnKeyType, onSubmitEditing, cfg,
    prefix, style: extraStyle,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    keyboardType?: any;
    maxLength?: number;
    autoFocus?: boolean;
    autoCapitalize?: any;
    returnKeyType?: any;
    onSubmitEditing?: () => void;
    cfg: DomainConfig;
    prefix?: string;
    style?: object;
}) {
    return (
        <View style={[inputS.row, {
            backgroundColor: cfg.primaryFrost,
            borderColor: cfg.cardBorder,
        }, extraStyle]}>
            {prefix ? <Text style={[inputS.prefix, { color: cfg.muted }]}>{prefix}</Text> : null}
            <TextInput
                style={[inputS.input, { color: cfg.text }, !prefix && { paddingLeft: sp(2) }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={cfg.muted}
                keyboardType={keyboardType}
                maxLength={maxLength}
                autoFocus={autoFocus}
                autoCapitalize={autoCapitalize ?? 'none'}
                returnKeyType={returnKeyType ?? 'done'}
                onSubmitEditing={onSubmitEditing}
            />
        </View>
    );
}

const inputS = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: R.lg, borderWidth: 1,
        minHeight: 56, overflow: 'hidden',
    },
    prefix: {
        fontSize: 16, fontWeight: '600',
        paddingLeft: sp(2), paddingRight: sp(1),
    },
    input: {
        flex: 1, fontSize: 16, fontWeight: '500',
        paddingRight: sp(2),
        paddingVertical: Platform.OS === 'ios' ? 16 : 13,
    },
});

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInputField({ value, onChangeText, onSubmitEditing, cfg }: {
    value: string; onChangeText: (t: string) => void; onSubmitEditing?: () => void; cfg: DomainConfig;
}) {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(true);

    const codeLength = 6;
    const codeArray = value.split('');

    return (
        <View style={otpS.container}>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                keyboardType="number-pad"
                maxLength={codeLength}
                returnKeyType="done"
                onSubmitEditing={onSubmitEditing}
                style={otpS.hiddenInput}
                autoFocus
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            <Pressable
                style={otpS.slotsRow}
                onPress={() => inputRef.current?.focus()}
                accessibilityRole="button"
                accessibilityLabel="Enter OTP code"
            >
                {Array(codeLength).fill(0).map((_, i) => {
                    const char = codeArray[i];
                    const isActive = isFocused && value.length === i;

                    return (
                        <View key={i} style={[
                            otpS.slot,
                            { backgroundColor: cfg.primaryFrost, borderColor: cfg.cardBorder },
                            isActive && { borderColor: cfg.primary, borderWidth: 2, transform: [{ scale: 1.05 }] },
                            char && { borderColor: cfg.primary + '80' }
                        ]}>
                            {char ? (
                                <Text style={[otpS.char, { color: cfg.text }]}>{char}</Text>
                            ) : isActive ? (
                                <View style={[otpS.cursor, { backgroundColor: cfg.primary }]} />
                            ) : null}
                        </View>
                    );
                })}
            </Pressable>
        </View>
    );
}

const otpS = StyleSheet.create({
    container: { width: '100%', marginVertical: sp(1) },
    hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
    slotsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    slot: {
        width: 48, height: 56, borderRadius: R.md, borderWidth: 1,
        justifyContent: 'center', alignItems: 'center',
    },
    char: { fontSize: 24, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
    cursor: { width: 2, height: 24, borderRadius: 1 },
});

// ─── CTA Button ───────────────────────────────────────────────────────────────

function CtaButton({
    label, onPress, disabled, loading, cfg,
}: {
    label: string; onPress: () => void; disabled?: boolean; loading?: boolean; cfg: DomainConfig;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 200, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 100, bounciness: 8 }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={disabled || loading ? undefined : onPress}
                onPressIn={disabled ? undefined : handlePressIn}
                onPressOut={disabled ? undefined : handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ disabled: disabled || loading }}
                style={{ opacity: disabled ? 0.45 : 1 }}
            >
                <LinearGradient
                    colors={disabled ? [cfg.divider, cfg.divider, cfg.divider] : cfg.ctaGrad as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={ctaS.btn}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" size="small" />
                        : <Text style={ctaS.label}>{label}</Text>}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const ctaS = StyleSheet.create({
    btn: {
        borderRadius: R.xl, paddingVertical: sp(2),
        alignItems: 'center', justifyContent: 'center',
        minHeight: 56, ...SHADOW.md,
    },
    label: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
});

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, cfg }: { message: string; cfg: DomainConfig }) {
    const style = useFadeUp(0, 6);
    return (
        <Animated.View style={[
            errBannerS.root,
            { backgroundColor: cfg.dangerBg, borderColor: cfg.danger + '30' },
            style,
        ]}>
            <Ionicons name="alert-circle-outline" size={15} color={cfg.danger} />
            <Text style={[errBannerS.text, { color: cfg.danger }]}>{message}</Text>
        </Animated.View>
    );
}

const errBannerS = StyleSheet.create({
    root: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: R.md, borderWidth: 1,
        paddingHorizontal: sp(1.75), paddingVertical: sp(1.25),
    },
    text: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});

// ─── Activation Flow ──────────────────────────────────────────────────────────
/**
 * Extracted component — receives DomainConfig and all existing handlers.
 * No logic lives here — purely presentation + existing callbacks.
 */

interface ActivationFlowProps {
    cfg: DomainConfig;
    tag: any;
    activationStep: number;
    phoneNumber: string;
    setPhoneNumber: (v: string) => void;
    otpValue: string;
    setOtpValue: (v: string) => void;
    plateNumber: string;
    setPlateNumber: (v: string) => void;
    activating: boolean;
    activationError: string;
    resendTimer: number;
    onSendOtp: () => void;
    onVerifyOtp: () => void;
    onActivate: () => void;
    onResendOtp: () => void;
    onChangeNumber: () => void;
    authUser: any;
    onActivateFromApp: () => void;
}

function ActivationFlow({
    cfg, tag, activationStep,
    phoneNumber, setPhoneNumber,
    otpValue, setOtpValue,
    plateNumber, setPlateNumber,
    activating, activationError, resendTimer,
    onSendOtp, onVerifyOtp, onActivate, onResendOtp, onChangeNumber,
    authUser, onActivateFromApp,
}: ActivationFlowProps) {
    const cardStyle = useFadeUp(120);

    return (
        <Animated.View style={[
            flowS.card,
            {
                backgroundColor: cfg.card,
                borderColor: cfg.cardBorder,
                borderRadius: cfg.cardRadius,
            },
            cardStyle,
        ]}>
            {/* Domain icon + title */}
            <View style={[flowS.iconChip, { backgroundColor: cfg.primaryGlow, borderColor: cfg.primary + '30' }]}>
                <Ionicons name={cfg.domainIcon as any} size={36} color={cfg.primary} />
            </View>

            <Text style={[flowS.title, { color: cfg.text }]}>{cfg.activationTitle}</Text>
            <Text style={[flowS.sub, { color: cfg.subtext }]}>
                {cfg.activationSub(tag.code)}
            </Text>

            {/* Step indicator */}
            <StepIndicator steps={cfg.stepLabels} current={activationStep} cfg={cfg} />

            {/* Error */}
            {activationError ? <ErrorBanner message={activationError} cfg={cfg} /> : null}

            {/* ── Step 0: Phone ── */}
            {activationStep === 0 && (
                <View style={flowS.stepBody}>
                    <Text style={[flowS.fieldLabel, { color: cfg.muted }]}>Mobile Number</Text>
                    <InputField
                        cfg={cfg}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="10-digit number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        autoFocus
                        prefix="+91"
                        returnKeyType="send"
                        onSubmitEditing={phoneNumber.length >= 10 ? onSendOtp : undefined}
                    />
                    <CtaButton
                        cfg={cfg}
                        label="Send OTP →"
                        onPress={onSendOtp}
                        disabled={phoneNumber.length < 10}
                        loading={activating}
                    />
                </View>
            )}

            {/* ── Step 1: OTP ── */}
            {activationStep === 1 && (
                <View style={flowS.stepBody}>
                    <Text style={[flowS.fieldLabel, { color: cfg.muted }]}>
                        Enter OTP sent to +91 {phoneNumber}
                    </Text>
                    <OtpInputField
                        cfg={cfg}
                        value={otpValue}
                        onChangeText={setOtpValue}
                        onSubmitEditing={otpValue.length === 6 ? onVerifyOtp : undefined}
                    />
                    <CtaButton
                        cfg={cfg}
                        label="Verify OTP →"
                        onPress={onVerifyOtp}
                        disabled={otpValue.length !== 6}
                    />
                    {/* Resend row */}
                    <View style={flowS.resendRow}>
                        {resendTimer > 0 ? (
                            <Text style={[flowS.resendMuted, { color: cfg.muted }]}>
                                Resend in {resendTimer}s
                            </Text>
                        ) : (
                            <Pressable onPress={onResendOtp} accessibilityRole="button">
                                <Text style={[flowS.resendActive, { color: cfg.primary }]}>Resend OTP</Text>
                            </Pressable>
                        )}
                        <Pressable onPress={onChangeNumber} accessibilityRole="button">
                            <Text style={[flowS.resendMuted, { color: cfg.muted }]}>Change Number</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* ── Step 2: Identifier ── */}
            {activationStep === 2 && (
                <View style={flowS.stepBody}>
                    <Text style={[flowS.fieldLabel, { color: cfg.muted }]}>{cfg.identifierLabel}</Text>
                    <InputField
                        cfg={cfg}
                        value={plateNumber}
                        onChangeText={setPlateNumber}
                        placeholder={cfg.identifierPlaceholder}
                        autoFocus
                        autoCapitalize={cfg.identifierAutoCapitalize}
                        maxLength={15}
                        returnKeyType="done"
                        onSubmitEditing={plateNumber.trim() ? onActivate : undefined}
                        style={cfg.domain === 'CAR' ? flowS.plateInput : undefined}
                    />
                    <CtaButton
                        cfg={cfg}
                        label={`Activate Tag 🚀`}
                        onPress={onActivate}
                        disabled={!plateNumber.trim()}
                        loading={activating}
                    />
                </View>
            )}

            {/* Already logged in shortcut */}
            {authUser && (
                <View style={[flowS.loginShortcut, { borderTopColor: cfg.divider }]}>
                    <Pressable onPress={onActivateFromApp} accessibilityRole="button">
                        <Text style={[flowS.loginShortcutText, { color: cfg.primary }]}>
                            Already logged in? Activate from app →
                        </Text>
                    </Pressable>
                </View>
            )}
        </Animated.View>
    );
}

const flowS = StyleSheet.create({
    card: {
        borderWidth: StyleSheet.hairlineWidth,
        padding: sp(3.5),
        alignItems: 'center',
        gap: sp(2),
        ...SHADOW.lg,
    },
    iconChip: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 1,
        justifyContent: 'center', alignItems: 'center', marginBottom: sp(0.5),
    },
    title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' },
    sub: { fontSize: 14, textAlign: 'center', opacity: 0.8, lineHeight: 20, marginTop: -sp(0.5) },
    stepBody: { width: '100%', gap: sp(2) },
    fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
    otpInput: { justifyContent: 'center' },
    plateInput: {},
    resendRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    resendActive: { fontSize: 13, fontWeight: '700' },
    resendMuted: { fontSize: 13, fontWeight: '500' },
    loginShortcut: {
        width: '100%', borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: sp(2), alignItems: 'center',
    },
    loginShortcutText: { fontSize: 14, fontWeight: '600' },
});

// ─── Footer ───────────────────────────────────────────────────────────────────

function ScreenFooter({ cfg }: { cfg: DomainConfig }) {
    const style = useFadeUp(300);
    return (
        <Animated.View style={[footerS.root, style]}>
            <Ionicons name="shield-checkmark" size={12} color={cfg.muted} />
            <Text style={[footerS.text, { color: cfg.muted }]}>Protected by {cfg.brandName}</Text>
        </Animated.View>
    );
}

const footerS = StyleSheet.create({
    root: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5, paddingVertical: sp(3) },
    text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PublicScanScreen() {
    const { tagId } = useLocalSearchParams<{ tagId: string }>();
    const router = useRouter();
    const t = useAppTheme();
    const getPublicTag = useTagStore((state) => state.getPublicTag);
    const activateTagSendOtp = useTagStore((state) => state.activateTagSendOtp);
    const activateTagVerifyOtp = useTagStore((state) => state.activateTagVerifyOtp);
    const { user: authUser } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [tag, setTag] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Activation flow state (unchanged) ──
    const [activationStep, setActivationStep] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [activating, setActivating] = useState(false);
    const [activationError, setActivationError] = useState('');
    const [activationSuccess, setActivationSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const isMountedRef = useRef(true);
    const refreshTagTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (refreshTagTimeoutRef.current) {
                clearTimeout(refreshTagTimeoutRef.current);
            }
        };
    }, []);

    // Derive domain type — defaults to CAR before tag loads
    const domainType: DomainType = useMemo(() => {
        const raw = tag?.metadata?.domainType ?? 'CAR';
        return (['CAR', 'KID', 'PET'] as const).includes(raw) ? raw : 'CAR';
    }, [tag]);

    const cfg = useMemo(
        () => getDomainConfig(domainType, t.isDark),
        [domainType, t.isDark]
    );

    const loadTag = useCallback(async () => {
        setLoading(true);
        if (__DEV__) console.log('Loading tag:', tagId);
        const data = await getPublicTag(tagId as string);
        if (__DEV__) console.log('Tag response:', JSON.stringify(data)?.slice(0, 200));

        if (!isMountedRef.current) {
            return;
        }

        if (data && data.success) {
            if (data.status === 'PROFILE_INCOMPLETE' || data.data?.metadata?.status === 'MINTED') {
                setTag({
                    code: tagId as string,
                    metadata: data.metadata || data.data?.metadata || { status: 'MINTED', domainType: 'CAR' },
                    status: 'created',
                    isActive: false,
                });
            } else {
                setTag(data.data);
            }
        } else if (data?.locked) {
            setTag({
                code: tagId as string,
                metadata: data?.metadata || { status: 'MINTED', domainType: 'CAR' },
                status: 'created',
                isActive: false,
            });
        } else {
            setError(data?.error?.message || 'Tag not found or inactive');
        }
        setLoading(false);
    }, [getPublicTag, tagId]);

    useEffect(() => {
        if (tagId) {
            void loadTag();
        }
    }, [tagId, loadTag]);

    // Resend timer countdown (unchanged)
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    // ── Activation handlers (unchanged logic) ──
    const handleSendOtp = useCallback(async () => {
        if (phoneNumber.length < 10) { setActivationError('Please enter a valid 10-digit mobile number'); return; }
        setActivating(true); setActivationError('');
        const success = await activateTagSendOtp(tag.code, `+91${phoneNumber}`);
        setActivating(false);
        if (success) { setActivationStep(1); setResendTimer(30); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
        else { setActivationError('Failed to send OTP. Please try again.'); }
    }, [phoneNumber, tag, activateTagSendOtp]);

    const handleResendOtp = useCallback(async () => {
        if (resendTimer > 0) return;
        setActivating(true); setActivationError('');
        const success = await activateTagSendOtp(tag.code, `+91${phoneNumber}`);
        setActivating(false);
        if (success) { setResendTimer(30); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    }, [resendTimer, phoneNumber, tag, activateTagSendOtp]);

    const handleVerifyOtp = useCallback(() => {
        if (otpValue.length !== 6) { setActivationError('Please enter the 6-digit OTP'); return; }
        setActivationStep(2); setActivationError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, [otpValue]);

    const handleActivate = useCallback(async () => {
        if (!plateNumber.trim()) {
            const lbl = domainType === 'KID' ? "child's name" : domainType === 'PET' ? 'pet name' : 'vehicle number';
            setActivationError(`Please enter your ${lbl}`); return;
        }
        setActivating(true); setActivationError('');
        const identifier = domainType === 'CAR' ? plateNumber.trim().toUpperCase() : plateNumber.trim();
        const result = await activateTagVerifyOtp(tag.code, `+91${phoneNumber}`, otpValue, identifier);
        setActivating(false);
        if (result.success) {
            if (result.user && result.token) {
                useAuthStore.setState({ user: result.user, token: result.token, isAuthenticated: true });
            }
            setActivationSuccess(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (refreshTagTimeoutRef.current) {
                clearTimeout(refreshTagTimeoutRef.current);
            }
            refreshTagTimeoutRef.current = setTimeout(() => {
                void loadTag();
            }, 1500);
        } else {
            setActivationError('Activation failed. Please try again.');
        }
    }, [plateNumber, domainType, phoneNumber, otpValue, tag, activateTagVerifyOtp, loadTag]);

    // ─── Loading ────────────────────────────────────────────────────────────────
    // Use a default CAR config while loading — will re-derive once tag loads.
    const loadingCfg = useMemo(() => getDomainConfig('CAR', t.isDark), [t.isDark]);

    if (loading) {
        return (
            <DomainShell cfg={loadingCfg}>
                <DomainHeader cfg={loadingCfg} paddingTop={insets.top} />
                <ScrollView
                    contentContainerStyle={[contentS.root, { paddingBottom: insets.bottom + sp(4) }]}
                    showsVerticalScrollIndicator={false}
                >
                    <DomainLoadingSkeleton cfg={loadingCfg} />
                </ScrollView>
            </DomainShell>
        );
    }

    // ─── Error ──────────────────────────────────────────────────────────────────

    if (error || !tag) {
        const errCfg = getDomainConfig('CAR', t.isDark);
        return (
            <DomainErrorState
                cfg={errCfg}
                onRetry={() => router.replace('/')}
                insetTop={insets.top}
            />
        );
    }

    // ─── Unclaimed Tag — Activation Flow ────────────────────────────────────────

    if (tag.status === 'created' || (tag.isActive === false && !tag.userId)) {

        if (activationSuccess) {
            return (
                <ActivationSuccess
                    cfg={cfg}
                    onContinue={() => router.replace('/(tabs)')}
                    insetTop={insets.top}
                />
            );
        }

        return (
            <DomainShell cfg={cfg}>
                <DomainHeader cfg={cfg} paddingTop={insets.top} />
                <ScrollView
                    contentContainerStyle={[contentS.root, { paddingBottom: insets.bottom + sp(6) }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ActivationFlow
                        cfg={cfg}
                        tag={tag}
                        activationStep={activationStep}
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        otpValue={otpValue}
                        setOtpValue={setOtpValue}
                        plateNumber={plateNumber}
                        setPlateNumber={setPlateNumber}
                        activating={activating}
                        activationError={activationError}
                        resendTimer={resendTimer}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                        onActivate={handleActivate}
                        onResendOtp={handleResendOtp}
                        onChangeNumber={() => { setActivationStep(0); setOtpValue(''); }}
                        authUser={authUser}
                        onActivateFromApp={() => router.push('/(tabs)/scan')}
                    />
                    <ScreenFooter cfg={cfg} />
                </ScrollView>
            </DomainShell>
        );
    }

    // ─── Active Tag — Domain Routing (unchanged) ─────────────────────────────────

    if (tag && tag.metadata) {
        const { metadata, payload } = tag;

        switch (metadata.domainType) {
            case 'CAR':
                return (
                    <ThemeProvider theme={CarTheme}>
                        <View style={{ flex: 1, backgroundColor: CarTheme.colors.background }}>
                            <CarScanView payload={payload} />
                        </View>
                    </ThemeProvider>
                );
            case 'KID':
                return (
                    <ThemeProvider theme={KidTheme}>
                        <View style={{ flex: 1, backgroundColor: KidTheme.colors.background }}>
                            <KidScanView payload={payload} />
                        </View>
                    </ThemeProvider>
                );
            case 'PET':
                return (
                    <ThemeProvider theme={PetTheme}>
                        <View style={{ flex: 1, backgroundColor: PetTheme.colors.background }}>
                            <PetScanView payload={payload} />
                        </View>
                    </ThemeProvider>
                );
            default:
                return (
                    <View style={[shellS.root, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text>Unknown Tag Domain</Text>
                    </View>
                );
        }
    }

    return null;
}

// ─── Content Container ────────────────────────────────────────────────────────

const contentS = StyleSheet.create({
    root: {
        paddingHorizontal: sp(2.5),
        paddingTop: sp(1),
        gap: sp(2),
    },
});
