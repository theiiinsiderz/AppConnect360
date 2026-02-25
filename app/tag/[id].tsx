/**
 * TagDetailScreen — Multi-Tag Elite UI v3
 *
 * Design Direction: "Purpose-Built Experiences"
 * Three distinct tag personalities within one unified design system.
 *
 * Tag Types:
 *  - 🧒 Kids  → Playful, safe, warm (soft purples + coral)
 *  - 🐶 Pets  → Joyful, organic, expressive (warm amber + teal)
 *  - 🚗 Vehicle → Professional, precise, data-dense (indigo + teal)
 *
 * v3 Changes:
 *  - TAG_THEMES: per-type color palette extending base palette
 *  - resolveTagType(): normalises domainType string → 'kids' | 'pet' | 'vehicle'
 *  - KidsHeroCard, PetHeroCard, VehicleHeroCard — each purpose-built
 *  - Shared design system: GlassCard, ToggleRow, ScanRow, CtaButton, DocRow unchanged
 *  - Tag-specific sections rendered per type
 *  - All Zustand stores & router calls untouched
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTagStore } from '../../store/tagStore';
import { useAppTheme } from '../../theme/theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TagType = 'kids' | 'pet' | 'vehicle';
type Mode = 'light' | 'dark';

// ─── Tag Type Resolver ─────────────────────────────────────────────────────────

function resolveTagType(domainType?: string): TagType {
    if (!domainType) return 'vehicle';
    const d = domainType.toUpperCase();
    if (['KID', 'KIDS', 'CHILD', 'CHILDREN'].includes(d)) return 'kids';
    if (['PET', 'DOG', 'CAT', 'ANIMAL', 'BIRD'].includes(d)) return 'pet';
    return 'vehicle';
}

// ─── Shared Design Tokens ──────────────────────────────────────────────────────

interface BasePalette {
    bg: readonly string[];
    surface: string;
    surfaceBorder: string;
    surfaceSolid: string;
    text: string;
    subtext: string;
    muted: string;
    success: string;
    successBg: string;
    successSoft: string;
    danger: string;
    dangerBg: string;
    dangerText: string;
    warning: string;
    warningBg: string;
    divider: string;
    border: string;
    switchTrackOff: string;
    scanDot: string;
    scanLine: string;
}

interface TagPalette extends BasePalette {
    // Brand
    primary: string;
    primarySoft: string;
    primaryBg: string;
    iconRing: string;
    callGrad: readonly string[];
    headerGrad: readonly string[];
    // Hero accent
    heroAccent: string;
    heroAccentSoft: string;
    // Number plate (vehicle-only; pets/kids use display name)
    plateYellow: string;
    plateBorder: string;
    plateText: string;
    plateIndStripe: string;
}

// ─── Tag-Specific Palettes ─────────────────────────────────────────────────────

const TAG_PALETTES: Record<TagType, Record<Mode, TagPalette>> = {
    // 🧒 Kids — soft purples + coral warmth
    kids: {
        light: {
            bg: ['#FDF5FF', '#FFF0F5', '#F5EEFF'] as const,
            surface: 'rgba(255,255,255,0.82)',
            surfaceBorder: 'rgba(255,255,255,0.94)',
            surfaceSolid: '#FFFFFF',
            text: '#1E0A2D',
            subtext: '#6B4A7E',
            muted: '#9C7AAD',
            primary: '#8B5CF6',
            primarySoft: '#A78BFA',
            primaryBg: 'rgba(139,92,246,0.10)',
            success: '#10B981',
            successBg: 'rgba(16,185,129,0.10)',
            successSoft: 'rgba(16,185,129,0.18)',
            danger: '#F43F5E',
            dangerBg: 'rgba(244,63,94,0.08)',
            dangerText: '#BE123C',
            warning: '#F59E0B',
            warningBg: 'rgba(245,158,11,0.10)',
            divider: 'rgba(139,92,246,0.08)',
            border: 'rgba(139,92,246,0.12)',
            switchTrackOff: '#E5D4FF',
            plateYellow: '#FFF4CC',
            plateBorder: '#C98C00',
            plateText: '#1A1506',
            plateIndStripe: '#003DA5',
            iconRing: 'rgba(139,92,246,0.12)',
            scanDot: '#8B5CF6',
            scanLine: 'rgba(139,92,246,0.15)',
            callGrad: ['#8B5CF6', '#EC4899'] as const,
            headerGrad: ['rgba(139,92,246,0.08)', 'rgba(236,72,153,0.00)'] as const,
            heroAccent: '#EC4899',
            heroAccentSoft: 'rgba(236,72,153,0.12)',
        },
        dark: {
            bg: ['#12062B', '#1A0A2E', '#0E0718'] as const,
            surface: 'rgba(255,255,255,0.05)',
            surfaceBorder: 'rgba(255,255,255,0.09)',
            surfaceSolid: '#160824',
            text: '#F3EEFF',
            subtext: '#C4A8E0',
            muted: '#7B5EA7',
            primary: '#A78BFA',
            primarySoft: '#C4B5FD',
            primaryBg: 'rgba(167,139,250,0.12)',
            success: '#34D399',
            successBg: 'rgba(52,211,153,0.12)',
            successSoft: 'rgba(52,211,153,0.20)',
            danger: '#FB7185',
            dangerBg: 'rgba(251,113,133,0.10)',
            dangerText: '#FDA4AF',
            warning: '#FCD34D',
            warningBg: 'rgba(252,211,77,0.10)',
            divider: 'rgba(167,139,250,0.08)',
            border: 'rgba(167,139,250,0.10)',
            switchTrackOff: '#3B2063',
            plateYellow: '#1C1700',
            plateBorder: '#F59E0B',
            plateText: '#FDE68A',
            plateIndStripe: '#2563EB',
            iconRing: 'rgba(167,139,250,0.14)',
            scanDot: '#A78BFA',
            scanLine: 'rgba(167,139,250,0.15)',
            callGrad: ['#7C3AED', '#DB2777'] as const,
            headerGrad: ['rgba(167,139,250,0.10)', 'rgba(167,139,250,0.00)'] as const,
            heroAccent: '#F472B6',
            heroAccentSoft: 'rgba(244,114,182,0.12)',
        },
    },

    // 🐶 Pets — warm amber + teal vitality
    pet: {
        light: {
            bg: ['#FFFBF0', '#FFF7E6', '#F0FDF9'] as const,
            surface: 'rgba(255,255,255,0.82)',
            surfaceBorder: 'rgba(255,255,255,0.94)',
            surfaceSolid: '#FFFFFF',
            text: '#1A1106',
            subtext: '#6B5020',
            muted: '#A07840',
            primary: '#F59E0B',
            primarySoft: '#FBC337',
            primaryBg: 'rgba(245,158,11,0.10)',
            success: '#0D9488',
            successBg: 'rgba(13,148,136,0.10)',
            successSoft: 'rgba(13,148,136,0.18)',
            danger: '#EF4444',
            dangerBg: 'rgba(239,68,68,0.08)',
            dangerText: '#B91C1C',
            warning: '#F97316',
            warningBg: 'rgba(249,115,22,0.10)',
            divider: 'rgba(245,158,11,0.10)',
            border: 'rgba(245,158,11,0.14)',
            switchTrackOff: '#FFE8A3',
            plateYellow: '#FFF4CC',
            plateBorder: '#C98C00',
            plateText: '#1A1506',
            plateIndStripe: '#003DA5',
            iconRing: 'rgba(245,158,11,0.12)',
            scanDot: '#F59E0B',
            scanLine: 'rgba(245,158,11,0.15)',
            callGrad: ['#F59E0B', '#0D9488'] as const,
            headerGrad: ['rgba(245,158,11,0.08)', 'rgba(13,148,136,0.00)'] as const,
            heroAccent: '#0D9488',
            heroAccentSoft: 'rgba(13,148,136,0.12)',
        },
        dark: {
            bg: ['#14100A', '#1C1406', '#0A1614'] as const,
            surface: 'rgba(255,255,255,0.05)',
            surfaceBorder: 'rgba(255,255,255,0.09)',
            surfaceSolid: '#1A1206',
            text: '#FFF8E8',
            subtext: '#D4A96A',
            muted: '#8A6A30',
            primary: '#FBC337',
            primarySoft: '#FDD771',
            primaryBg: 'rgba(251,195,55,0.12)',
            success: '#2DD4BF',
            successBg: 'rgba(45,212,191,0.12)',
            successSoft: 'rgba(45,212,191,0.20)',
            danger: '#F87171',
            dangerBg: 'rgba(248,113,113,0.10)',
            dangerText: '#FCA5A5',
            warning: '#FB923C',
            warningBg: 'rgba(251,146,60,0.10)',
            divider: 'rgba(251,195,55,0.08)',
            border: 'rgba(251,195,55,0.10)',
            switchTrackOff: '#3D2C00',
            plateYellow: '#1C1700',
            plateBorder: '#F59E0B',
            plateText: '#FDE68A',
            plateIndStripe: '#2563EB',
            iconRing: 'rgba(251,195,55,0.14)',
            scanDot: '#FBC337',
            scanLine: 'rgba(251,195,55,0.15)',
            callGrad: ['#D97706', '#0D9488'] as const,
            headerGrad: ['rgba(251,195,55,0.10)', 'rgba(251,195,55,0.00)'] as const,
            heroAccent: '#2DD4BF',
            heroAccentSoft: 'rgba(45,212,191,0.12)',
        },
    },

    // 🚗 Vehicle — Warning Yellow + Industrial Black (Traffic Aesthetic)
    vehicle: {
        light: {
            bg: ['#FFFBEB', '#FEF3C7', '#FDE68A'] as const,
            surface: 'rgba(255,255,255,0.85)',
            surfaceBorder: 'rgba(234,179,8,0.2)',
            surfaceSolid: '#FFFFFF',
            text: '#1A1106',
            subtext: '#6B5020',
            muted: '#A07840',
            primary: '#EAB308',
            primarySoft: '#FACC15',
            primaryBg: 'rgba(250,204,21,0.12)',
            success: '#0CA678',
            successBg: 'rgba(12,166,120,0.10)',
            successSoft: 'rgba(12,166,120,0.18)',
            danger: '#E5383B',
            dangerBg: 'rgba(229,56,59,0.08)',
            dangerText: '#BA181B',
            warning: '#E8A317',
            warningBg: 'rgba(232,163,23,0.10)',
            divider: 'rgba(0,0,0,0.06)',
            border: 'rgba(0,0,0,0.07)',
            switchTrackOff: '#E5E7EB',
            plateYellow: '#FACC15',
            plateBorder: '#EAB308',
            plateText: '#000000',
            plateIndStripe: '#003DA5',
            iconRing: 'rgba(250,204,21,0.15)',
            scanDot: '#EAB308',
            scanLine: 'rgba(250,204,21,0.2)',
            callGrad: ['#F59E0B', '#EAB308'] as const,
            headerGrad: ['rgba(250,204,21,0.12)', 'rgba(250,204,21,0.00)'] as const,
            heroAccent: '#EAB308',
            heroAccentSoft: 'rgba(250,204,21,0.12)',
        },
        dark: {
            bg: ['#000000', '#09090B', '#111827'] as const,
            surface: 'rgba(255,255,255,0.04)',
            surfaceBorder: 'rgba(250,204,21,0.15)',
            surfaceSolid: '#111827',
            text: '#FFFFFF',
            subtext: 'rgba(250,204,21,0.8)',
            muted: 'rgba(250,204,21,0.4)',
            primary: '#FACC15',
            primarySoft: '#FDE68A',
            primaryBg: 'rgba(250,204,21,0.12)',
            success: '#34D399',
            successBg: 'rgba(52,211,153,0.12)',
            successSoft: 'rgba(52,211,153,0.20)',
            danger: '#F87171',
            dangerBg: 'rgba(248,113,113,0.10)',
            dangerText: '#FCA5A5',
            warning: '#FCD34D',
            warningBg: 'rgba(252,211,77,0.10)',
            divider: 'rgba(255,255,255,0.06)',
            border: 'rgba(255,255,255,0.1)',
            switchTrackOff: '#374151',
            plateYellow: '#FACC15',
            plateBorder: '#EAB308',
            plateText: '#000000',
            plateIndStripe: '#2563EB',
            iconRing: 'rgba(250,204,21,0.2)',
            scanDot: '#FACC15',
            scanLine: 'rgba(250,204,21,0.25)',
            callGrad: ['#F59E0B', '#FACC15'] as const,
            headerGrad: ['rgba(250,204,21,0.15)', 'rgba(250,204,21,0.00)'] as const,
            heroAccent: '#FACC15',
            heroAccentSoft: 'rgba(250,204,21,0.14)',
        },
    },
};

// ─── Tag Config (icons, labels, emoji) ────────────────────────────────────────

interface TagConfig {
    emoji: string;
    mainIcon: string;
    label: string;
    scanLabel: string;
    heroRadius: number;
    heroIconSize: number;
}

const TAG_CONFIG: Record<TagType, TagConfig> = {
    kids: {
        emoji: '🧒',
        mainIcon: 'happy',
        label: 'Child Tag',
        scanLabel: 'Check-ins',
        heroRadius: 50,
        heroIconSize: 48,
    },
    pet: {
        emoji: '🐾',
        mainIcon: 'paw',
        label: 'Pet Tag',
        scanLabel: 'Sightings',
        heroRadius: 46,
        heroIconSize: 44,
    },
    vehicle: {
        emoji: '🚗',
        mainIcon: 'car-sport',
        label: 'Vehicle Tag',
        scanLabel: 'Total Scans',
        heroRadius: 42,
        heroIconSize: 42,
    },
};

// ─── Pulsing Dot ───────────────────────────────────────────────────────────────

function PulsingDot({ color, size = 8 }: { color: string; size?: number }) {
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={{ width: size * 3, height: size * 3, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
                style={{
                    position: 'absolute',
                    width: size * 2.5,
                    height: size * 2.5,
                    borderRadius: size * 1.5,
                    backgroundColor: color,
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
                    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }],
                }}
            />
            <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
        </View>
    );
}

// ─── Animated Press Wrapper ────────────────────────────────────────────────────

function PressScale({
    children, onPress, disabled, haptic = 'light', style, accessibilityLabel, accessibilityRole,
}: {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    haptic?: 'light' | 'medium' | 'heavy' | 'none';
    style?: any;
    accessibilityLabel?: string;
    accessibilityRole?: any;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () => {
        if (haptic !== 'none') {
            Haptics.impactAsync(
                haptic === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy
                    : haptic === 'medium' ? Haptics.ImpactFeedbackStyle.Medium
                        : Haptics.ImpactFeedbackStyle.Light
            );
        }
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
    };
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <Pressable
                onPress={disabled ? undefined : onPress}
                onPressIn={disabled ? undefined : pressIn}
                onPressOut={disabled ? undefined : pressOut}
                disabled={disabled}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole={accessibilityRole}
                style={{ opacity: disabled ? 0.4 : 1 }}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ label, icon, colors: c }: { label: string; icon?: string; colors: TagPalette }) {
    return (
        <View style={sh.row}>
            {icon && (
                <View style={[sh.iconDot, { backgroundColor: c.primaryBg }]}>
                    <Ionicons name={icon as any} size={12} color={c.primary} />
                </View>
            )}
            <Text style={[sh.label, { color: c.muted }]}>{label.toUpperCase()}</Text>
        </View>
    );
}

const sh = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 30, paddingHorizontal: 2, gap: 8 },
    iconDot: { width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
});

// ─── Glass Card ────────────────────────────────────────────────────────────────

function GlassCard({ children, colors: c, style }: { children: React.ReactNode; colors: TagPalette; style?: any }) {
    const isDark = c.bg[0].toLowerCase().startsWith('#07') || c.bg[0].toLowerCase().startsWith('#08')
        || c.bg[0].toLowerCase().startsWith('#12') || c.bg[0].toLowerCase().startsWith('#14')
        || c.bg[0].toLowerCase().startsWith('#0a') || c.bg[0].toLowerCase().startsWith('#0c')
        || c.bg[0].toLowerCase().startsWith('#1a') || c.bg[0].toLowerCase().startsWith('#1c');

    if (Platform.OS === 'ios') {
        return (
            <BlurView intensity={isDark ? 18 : 50} tint={isDark ? 'dark' : 'light'} style={[gc.card, { borderColor: c.surfaceBorder }, style]}>
                {children}
            </BlurView>
        );
    }
    return (
        <View style={[gc.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }, style]}>
            {children}
        </View>
    );
}

const gc = StyleSheet.create({
    card: { borderRadius: 22, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
});

// ─── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
    label, description, icon, value, onChange, isLast, colors: c,
}: {
    label: string; description: string; icon: string; value: boolean;
    onChange: () => void; isLast?: boolean; colors: TagPalette;
}) {
    return (
        <View>
            <View style={tr.row}>
                <View style={[tr.iconBox, { backgroundColor: value ? c.primaryBg : c.divider }]}>
                    <Ionicons name={icon as any} size={20} color={value ? c.primary : c.muted} />
                </View>
                <View style={tr.textCol}>
                    <Text style={[tr.label, { color: c.text }]}>{label}</Text>
                    <Text style={[tr.desc, { color: c.muted }]}>{description}</Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(); }}
                    trackColor={{ false: c.switchTrackOff, true: c.primary + 'CC' }}
                    thumbColor={Platform.OS === 'android' ? (value ? c.primary : '#FFF') : undefined}
                    ios_backgroundColor={c.switchTrackOff}
                    accessibilityRole="switch"
                    accessibilityLabel={label}
                    accessibilityState={{ checked: value }}
                />
            </View>
            {!isLast && <View style={[tr.divider, { backgroundColor: c.divider }]} />}
        </View>
    );
}

const tr = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    textCol: { flex: 1, paddingRight: 10 },
    label: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
    desc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
    divider: { height: StyleSheet.hairlineWidth, marginLeft: 74 },
});

// ─── Document Row ──────────────────────────────────────────────────────────────

function DocRow({
    icon, label, status, isLast, onPress, colors: c,
}: {
    icon: string; label: string; status?: 'uploaded' | 'missing';
    isLast?: boolean; onPress: () => void; colors: TagPalette;
}) {
    const isUploaded = status === 'uploaded';
    return (
        <View>
            <PressScale onPress={onPress} haptic="light" accessibilityRole="button" accessibilityLabel={label}>
                <View style={dr.row}>
                    <View style={[dr.iconBox, { backgroundColor: c.primaryBg }]}>
                        <Ionicons name={icon as any} size={18} color={c.primary} />
                    </View>
                    <View style={dr.textCol}>
                        <Text style={[dr.label, { color: c.text }]}>{label}</Text>
                        <Text style={[dr.status, { color: isUploaded ? c.success : c.warning }]}>
                            {isUploaded ? 'Document uploaded' : 'Tap to upload'}
                        </Text>
                    </View>
                    <Ionicons name={isUploaded ? 'checkmark-circle' : 'cloud-upload-outline'} size={20} color={isUploaded ? c.success : c.muted} />
                </View>
            </PressScale>
            {!isLast && <View style={[dr.divider, { backgroundColor: c.divider }]} />}
        </View>
    );
}

const dr = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
    iconBox: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    textCol: { flex: 1, paddingRight: 8 },
    label: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
    status: { fontSize: 12, marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
});

// ─── Scan Event Row ────────────────────────────────────────────────────────────

function ScanRow({ scan, isLast, colors: c }: { scan: { location: string; timestamp: string }; isLast: boolean; colors: TagPalette }) {
    const date = new Date(scan.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <View style={sr.wrapper}>
            <View style={sr.timeline}>
                <View style={[sr.dot, { backgroundColor: c.scanDot }]} />
                {!isLast && <View style={[sr.line, { backgroundColor: c.scanLine }]} />}
            </View>
            <View style={[sr.content, isLast && { marginBottom: 0 }]}>
                <View style={[sr.card, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
                    <View style={sr.row}>
                        <Ionicons name="scan-outline" size={15} color={c.primary} style={{ marginRight: 8 }} />
                        <Text style={[sr.location, { color: c.text }]} numberOfLines={1}>{scan.location || 'Unknown location'}</Text>
                    </View>
                    <Text style={[sr.time, { color: c.muted }]}>{dateStr} · {timeStr}</Text>
                </View>
            </View>
        </View>
    );
}

const sr = StyleSheet.create({
    wrapper: { flexDirection: 'row', marginBottom: 0 },
    timeline: { width: 24, alignItems: 'center', paddingTop: 14 },
    dot: { width: 9, height: 9, borderRadius: 5, zIndex: 1 },
    line: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
    content: { flex: 1, marginLeft: 12, marginBottom: 10 },
    card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
    row: { flexDirection: 'row', alignItems: 'center' },
    location: { fontSize: 14, fontWeight: '600', flex: 1 },
    time: { fontSize: 12, marginTop: 4 },
});

// ─── CTA Button ────────────────────────────────────────────────────────────────

function CtaButton({
    label, icon, variant = 'primary', onPress, colors: c,
}: {
    label: string; icon: string; variant?: 'primary' | 'outline' | 'danger';
    onPress: () => void; colors: TagPalette;
}) {
    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';

    return (
        <PressScale onPress={onPress} haptic={isDanger ? 'heavy' : 'medium'} style={{ marginBottom: 12 }} accessibilityRole="button" accessibilityLabel={label}>
            {isPrimary ? (
                <LinearGradient colors={c.callGrad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ctb.btn}>
                    <Ionicons name={icon as any} size={18} color="#FFF" style={{ marginRight: 10 }} />
                    <Text style={[ctb.label, { color: '#FFF' }]}>{label}</Text>
                </LinearGradient>
            ) : (
                <View style={[ctb.btn, { backgroundColor: isDanger ? c.dangerBg : 'transparent', borderWidth: 1.5, borderColor: isDanger ? c.danger : c.border }]}>
                    <Ionicons name={icon as any} size={18} color={isDanger ? c.danger : c.primary} style={{ marginRight: 10 }} />
                    <Text style={[ctb.label, { color: isDanger ? c.dangerText : c.primary }]}>{label}</Text>
                </View>
            )}
        </PressScale>
    );
}

const ctb = StyleSheet.create({
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, minHeight: 56 },
    label: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
});

// ─── Stat Cell ─────────────────────────────────────────────────────────────────

function StatCell({ icon, value, label, valueColor, colors: c }: {
    icon: string; value: string; label: string; valueColor?: string; colors: TagPalette;
}) {
    return (
        <View style={sc.item}>
            <View style={[sc.iconCircle, { backgroundColor: c.primaryBg }]}>
                <Ionicons name={icon as any} size={14} color={c.primary} />
            </View>
            <Text style={[sc.value, { color: valueColor || c.text }]}>{value}</Text>
            <Text style={[sc.label, { color: c.muted }]}>{label}</Text>
        </View>
    );
}

const sc = StyleSheet.create({
    item: { flex: 1, alignItems: 'center', gap: 4 },
    iconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
    value: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
    label: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
});

// ─── Indian Number Plate (vehicle-only) ────────────────────────────────────────

function IndianPlate({ number, colors: c }: { number?: string; colors: TagPalette }) {
    if (!number) return null;
    return (
        <View style={[plt.outer, { backgroundColor: c.plateYellow, borderColor: c.plateBorder }]}>
            <View style={[plt.indStripe, { backgroundColor: c.plateIndStripe }]}>
                <Text style={plt.indAshoka}>✦</Text>
                <Text style={plt.indText}>IND</Text>
            </View>
            <View style={plt.textArea}>
                <Text style={[plt.plateText, { color: c.plateText }]} numberOfLines={1} adjustsFontSizeToFit>{number}</Text>
            </View>
            <View style={[plt.bolt, plt.boltTL, { borderColor: c.plateBorder }]} />
            <View style={[plt.bolt, plt.boltTR, { borderColor: c.plateBorder }]} />
            <View style={[plt.bolt, plt.boltBL, { borderColor: c.plateBorder }]} />
            <View style={[plt.bolt, plt.boltBR, { borderColor: c.plateBorder }]} />
        </View>
    );
}

const plt = StyleSheet.create({
    outer: { borderRadius: 8, borderWidth: 2.5, paddingVertical: 8, paddingRight: 18, paddingLeft: 0, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4, overflow: 'hidden', minWidth: 240 },
    indStripe: { width: 32, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 4 },
    indAshoka: { fontSize: 10, color: '#FFFFFF', marginBottom: 1 },
    indText: { fontSize: 9, color: '#FFFFFF', fontWeight: '800', letterSpacing: 1 },
    textArea: { flex: 1, paddingLeft: 14, paddingRight: 4, justifyContent: 'center' },
    plateText: { fontSize: 28, fontWeight: '900', letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', textTransform: 'uppercase' },
    bolt: { position: 'absolute', width: 6, height: 6, borderRadius: 3, borderWidth: 1, backgroundColor: 'rgba(128,128,128,0.2)' },
    boltTL: { top: 4, left: 36 },
    boltTR: { top: 4, right: 6 },
    boltBL: { bottom: 4, left: 36 },
    boltBR: { bottom: 4, right: 6 },
});

// ─── Info Row (reusable key-value row for detail sections) ─────────────────────

function InfoRow({
    icon, label, value, isLast, colors: c,
}: {
    icon: string; label: string; value: string; isLast?: boolean; colors: TagPalette;
}) {
    return (
        <View>
            <View style={ir.row}>
                <View style={[ir.iconBox, { backgroundColor: c.primaryBg }]}>
                    <Ionicons name={icon as any} size={18} color={c.primary} />
                </View>
                <View style={ir.textCol}>
                    <Text style={[ir.label, { color: c.muted }]}>{label}</Text>
                    <Text style={[ir.value, { color: c.text }]}>{value}</Text>
                </View>
            </View>
            {!isLast && <View style={[ir.divider, { backgroundColor: c.divider }]} />}
        </View>
    );
}

const ir = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
    iconBox: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    textCol: { flex: 1 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
    value: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
    divider: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
});

// ─── 🚗 Vehicle Hero Card ──────────────────────────────────────────────────────

function VehicleHeroCard({ tag, colors: c }: { tag: any; colors: TagPalette }) {
    const vehicleIcon = tag.domainType === 'BIKE' ? 'bicycle' : 'car-sport';
    return (
        <LinearGradient colors={c.headerGrad as any} style={[styles.heroCard, { borderColor: c.surfaceBorder }]}>
            <View style={[styles.statusPill, { backgroundColor: tag.isActive ? c.successBg : c.dangerBg }]}>
                <PulsingDot color={tag.isActive ? c.success : c.danger} size={8} />
                <Text style={[styles.statusText, { color: tag.isActive ? c.success : c.danger }]}>
                    {tag.isActive ? 'Active' : 'Disabled'}
                </Text>
            </View>
            <View style={[styles.vehicleIcon, { backgroundColor: c.iconRing }]}>
                <Ionicons name={vehicleIcon as any} size={42} color={c.primary} />
            </View>
            <IndianPlate number={tag.config?.plateNumber || tag.plateNumber} colors={c} />
            {tag.nickname ? <Text style={[styles.nickname, { color: c.text }]}>{tag.nickname}</Text> : null}
            <Text style={[styles.tagCode, { color: c.muted }]}>#{tag.code || tag._id?.slice(-8).toUpperCase()}</Text>
            <View style={[styles.statsRow, { borderTopColor: c.divider }]}>
                <StatCell icon="analytics-outline" value={String(tag.scans?.length ?? 0)} label="Total Scans" colors={c} />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell
                    icon="time-outline"
                    value={tag.scans?.length ? new Date(tag.scans[tag.scans.length - 1].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                    label="Last Scan"
                    colors={c}
                />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell icon="radio-outline" value={tag.isActive ? 'ON' : 'OFF'} label="Status" valueColor={tag.isActive ? c.success : c.danger} colors={c} />
            </View>
        </LinearGradient>
    );
}

// ─── 🧒 Kids Hero Card ─────────────────────────────────────────────────────────

function KidsHeroCard({ tag, colors: c }: { tag: any; colors: TagPalette }) {
    const childName = tag.config?.childName || tag.config?.displayName || tag.nickname || 'Child';
    const gradeOrAge = tag.config?.grade || tag.config?.age ? `${tag.config?.age ? `Age ${tag.config.age}` : ''} ${tag.config?.grade ? `· ${tag.config.grade}` : ''}`.trim() : null;

    return (
        <LinearGradient colors={c.headerGrad as any} style={[styles.heroCard, { borderColor: c.surfaceBorder, borderRadius: 32 }]}>
            {/* Friendly status */}
            <View style={[styles.statusPill, { backgroundColor: tag.isActive ? c.successBg : c.dangerBg }]}>
                <PulsingDot color={tag.isActive ? c.success : c.danger} size={7} />
                <Text style={[styles.statusText, { color: tag.isActive ? c.success : c.danger }]}>
                    {tag.isActive ? '✓ Protected' : 'Inactive'}
                </Text>
            </View>

            {/* Big emoji avatar with soft ring */}
            <View style={[kh.avatarRing, { backgroundColor: c.heroAccentSoft, borderColor: c.heroAccent + '44' }]}>
                <View style={[kh.avatarInner, { backgroundColor: c.primaryBg }]}>
                    <Text style={kh.emoji}>🧒</Text>
                </View>
            </View>

            {/* Name + code */}
            <Text style={[kh.name, { color: c.text }]}>{childName}</Text>
            {gradeOrAge ? <Text style={[kh.sub, { color: c.subtext }]}>{gradeOrAge}</Text> : null}
            <Text style={[styles.tagCode, { color: c.muted }]}>#{tag.code || tag._id?.slice(-8).toUpperCase()}</Text>

            {/* Safety stats */}
            <View style={[styles.statsRow, { borderTopColor: c.divider }]}>
                <StatCell icon="footsteps-outline" value={String(tag.scans?.length ?? 0)} label="Check-ins" colors={c} />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell
                    icon="calendar-outline"
                    value={tag.scans?.length ? new Date(tag.scans[tag.scans.length - 1].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                    label="Last Seen"
                    colors={c}
                />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell icon="shield-checkmark-outline" value={tag.isActive ? 'Safe' : 'OFF'} label="Status" valueColor={tag.isActive ? c.success : c.danger} colors={c} />
            </View>
        </LinearGradient>
    );
}

const kh = StyleSheet.create({
    avatarRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    avatarInner: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
    emoji: { fontSize: 46 },
    name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6, marginBottom: 4 },
    sub: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
});

// ─── 🐶 Pet Hero Card ──────────────────────────────────────────────────────────

function PetHeroCard({ tag, colors: c }: { tag: any; colors: TagPalette }) {
    const petName = tag.config?.petName || tag.config?.displayName || tag.nickname || 'Pet';
    const breed = tag.config?.breed || tag.config?.petType || null;
    const petEmoji = tag.config?.petType === 'cat' ? '🐱' : tag.config?.petType === 'bird' ? '🦜' : '🐶';

    return (
        <LinearGradient colors={c.headerGrad as any} style={[styles.heroCard, { borderColor: c.surfaceBorder, borderRadius: 28 }]}>
            {/* Status */}
            <View style={[styles.statusPill, { backgroundColor: tag.isActive ? c.successBg : c.dangerBg }]}>
                <PulsingDot color={tag.isActive ? c.success : c.danger} size={8} />
                <Text style={[styles.statusText, { color: tag.isActive ? c.success : c.danger }]}>
                    {tag.isActive ? '🏡 Home' : 'Lost Alert'}
                </Text>
            </View>

            {/* Pet avatar with warm layered rings */}
            <View style={[ph.outerRing, { borderColor: c.primary + '30', backgroundColor: c.heroAccentSoft }]}>
                <View style={[ph.innerRing, { backgroundColor: c.primaryBg }]}>
                    <Text style={ph.petEmoji}>{petEmoji}</Text>
                </View>
            </View>

            {/* Pet name + breed */}
            <Text style={[ph.petName, { color: c.text }]}>{petName}</Text>
            {breed ? <Text style={[ph.breed, { color: c.subtext }]}>{breed}</Text> : null}
            <Text style={[styles.tagCode, { color: c.muted }]}>#{tag.code || tag._id?.slice(-8).toUpperCase()}</Text>

            {/* Pet stats */}
            <View style={[styles.statsRow, { borderTopColor: c.divider }]}>
                <StatCell icon="paw-outline" value={String(tag.scans?.length ?? 0)} label="Sightings" colors={c} />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell
                    icon="location-outline"
                    value={tag.scans?.length ? new Date(tag.scans[tag.scans.length - 1].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                    label="Last Scan"
                    colors={c}
                />
                <View style={[styles.statDivider, { backgroundColor: c.divider }]} />
                <StatCell icon="heart-outline" value={tag.isActive ? 'Active' : 'OFF'} label="Status" valueColor={tag.isActive ? c.success : c.danger} colors={c} />
            </View>
        </LinearGradient>
    );
}

const ph = StyleSheet.create({
    outerRing: { width: 116, height: 116, borderRadius: 58, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    innerRing: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
    petEmoji: { fontSize: 48 },
    petName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginBottom: 4 },
    breed: { fontSize: 13, fontWeight: '500', marginBottom: 4, textTransform: 'capitalize' },
});

// ─── Tag-Specific Sections ─────────────────────────────────────────────────────

/** 🧒 Kids-specific sections: child details + parental controls */
function KidsSections({ tag, handleToggle, c }: { tag: any; handleToggle: (key: string) => void; c: TagPalette }) {
    return (
        <>
            <SectionHeader label="Child Details" icon="person-outline" colors={c} />
            <GlassCard colors={c}>
                {tag.config?.school && <InfoRow icon="school-outline" label="School" value={tag.config.school} colors={c} />}
                {tag.config?.bloodGroup && <InfoRow icon="medical-outline" label="Blood Group" value={tag.config.bloodGroup} colors={c} />}
                {tag.config?.allergies && <InfoRow icon="warning-outline" label="Allergies" value={tag.config.allergies} isLast colors={c} />}
                {!tag.config?.school && !tag.config?.bloodGroup && (
                    <InfoRow icon="information-circle-outline" label="Profile" value="No details added yet" isLast colors={c} />
                )}
            </GlassCard>

            <SectionHeader label="Safety Controls" icon="shield-checkmark-outline" colors={c} />
            <GlassCard colors={c}>
                <ToggleRow icon="call-outline" label="Masked Calls" description="Anonymous call via number masking" value={tag.privacy?.allowMaskedCall ?? false} onChange={() => handleToggle('allowMaskedCall')} colors={c} />
                <ToggleRow icon="chatbubble-outline" label="SMS Contact" description="Allow SMS from the public scan page" value={tag.privacy?.allowSms ?? false} onChange={() => handleToggle('allowSms')} colors={c} />
                <ToggleRow icon="alert-circle-outline" label="Emergency Contact" description="Show emergency contact to scanner" value={tag.privacy?.showEmergencyContact ?? false} onChange={() => handleToggle('showEmergencyContact')} isLast colors={c} />
            </GlassCard>
        </>
    );
}

/** 🐶 Pets-specific sections: pet profile + vet info + contact */
function PetsSections({ tag, handleToggle, c }: { tag: any; handleToggle: (key: string) => void; c: TagPalette }) {
    return (
        <>
            <SectionHeader label="Pet Profile" icon="paw-outline" colors={c} />
            <GlassCard colors={c}>
                {tag.config?.petType && <InfoRow icon="paw-outline" label="Type" value={tag.config.petType} colors={c} />}
                {tag.config?.breed && <InfoRow icon="leaf-outline" label="Breed" value={tag.config.breed} colors={c} />}
                {tag.config?.age && <InfoRow icon="calendar-outline" label="Age" value={tag.config.age} colors={c} />}
                {tag.config?.microchipId && <InfoRow icon="barcode-outline" label="Microchip ID" value={tag.config.microchipId} isLast colors={c} />}
                {!tag.config?.petType && <InfoRow icon="information-circle-outline" label="Profile" value="No pet details added" isLast colors={c} />}
            </GlassCard>

            <SectionHeader label="Vet & Medical" icon="medkit-outline" colors={c} />
            <GlassCard colors={c}>
                {tag.config?.vetName && <InfoRow icon="person-outline" label="Veterinarian" value={tag.config.vetName} colors={c} />}
                {tag.config?.vaccinationStatus && <InfoRow icon="shield-checkmark-outline" label="Vaccination" value={tag.config.vaccinationStatus} isLast colors={c} />}
                {!tag.config?.vetName && <InfoRow icon="information-circle-outline" label="Vet Info" value="No vet details added" isLast colors={c} />}
            </GlassCard>

            <SectionHeader label="Contact Settings" icon="call-outline" colors={c} />
            <GlassCard colors={c}>
                <ToggleRow icon="call-outline" label="Masked Calls" description="Allow anonymous call via number masking" value={tag.privacy?.allowMaskedCall ?? false} onChange={() => handleToggle('allowMaskedCall')} colors={c} />
                <ToggleRow icon="logo-whatsapp" label="WhatsApp" description="Enable WhatsApp contact from scan page" value={tag.privacy?.allowWhatsapp ?? false} onChange={() => handleToggle('allowWhatsapp')} colors={c} />
                <ToggleRow icon="alert-circle-outline" label="Emergency Contact" description="Show emergency contact to scanner" value={tag.privacy?.showEmergencyContact ?? false} onChange={() => handleToggle('showEmergencyContact')} isLast colors={c} />
            </GlassCard>
        </>
    );
}

/** 🚗 Vehicle-specific sections: privacy + documents */
function VehicleSections({ tag, handleToggle, c }: { tag: any; handleToggle: (key: string) => void; c: TagPalette }) {
    return (
        <>
            {tag.config?.make && (
                <>
                    <SectionHeader label="Vehicle Info" icon="information-circle-outline" colors={c} />
                    <GlassCard colors={c}>
                        {tag.config.make && <InfoRow icon="car-outline" label="Make & Model" value={`${tag.config.make} ${tag.config.model || ''}`.trim()} colors={c} />}
                        {tag.config.year && <InfoRow icon="calendar-outline" label="Year" value={tag.config.year} colors={c} />}
                        {tag.config.color && <InfoRow icon="color-palette-outline" label="Color" value={tag.config.color} isLast colors={c} />}
                    </GlassCard>
                </>
            )}

            <SectionHeader label="Privacy Controls" icon="shield-checkmark-outline" colors={c} />
            <GlassCard colors={c}>
                <ToggleRow icon="call-outline" label="Masked Calls" description="Allow anonymous calls via number masking" value={tag.privacy?.allowMaskedCall ?? false} onChange={() => handleToggle('allowMaskedCall')} colors={c} />
                <ToggleRow icon="logo-whatsapp" label="WhatsApp" description="Enable WhatsApp contact from scan page" value={tag.privacy?.allowWhatsapp ?? false} onChange={() => handleToggle('allowWhatsapp')} colors={c} />
                <ToggleRow icon="chatbubble-outline" label="SMS" description="Allow SMS from the public scan page" value={tag.privacy?.allowSms ?? false} onChange={() => handleToggle('allowSms')} colors={c} />
                <ToggleRow icon="alert-circle-outline" label="Emergency Contact" description="Show emergency contact to scanner" value={tag.privacy?.showEmergencyContact ?? false} onChange={() => handleToggle('showEmergencyContact')} isLast colors={c} />
            </GlassCard>

            <SectionHeader label="Vehicle Documents" icon="folder-outline" colors={c} />
            <GlassCard colors={c}>
                <DocRow icon="document-text-outline" label="RC Book" status="missing" onPress={() => { }} colors={c} />
                <DocRow icon="shield-checkmark-outline" label="Insurance Policy" status="missing" isLast onPress={() => { }} colors={c} />
            </GlassCard>
        </>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function TagDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const t = useAppTheme();
    const mode: Mode = t.isDark ? 'dark' : 'light';
    const { tags, togglePrivacy } = useTagStore();
    const { user } = useAuthStore();
    const insets = useSafeAreaInsets();

    const tag = tags.find(t => t._id === id);
    const tagType = resolveTagType(tag?.domainType);
    const c = TAG_PALETTES[tagType][mode];
    const cfg = TAG_CONFIG[tagType];

    const isOwner = tag?.userId === (user as any)?._id || tag?.userId === (user as any)?.id;

    const handleToggle = useCallback(
        (key: string) => { if (tag) togglePrivacy(tag._id, key as any); },
        [tag, togglePrivacy]
    );

    if (!tag) {
        return (
            <LinearGradient colors={c.bg as any} style={styles.flex}>
                <View style={[styles.centerState, { paddingTop: insets.top }]}>
                    <View style={[styles.stateIcon, { backgroundColor: c.primaryBg }]}>
                        <Ionicons name="pricetag-outline" size={36} color={c.primary} />
                    </View>
                    <Text style={[styles.stateTitle, { color: c.text }]}>Tag Not Found</Text>
                    <Text style={[styles.stateSub, { color: c.subtext }]}>
                        This tag may have been removed or the link is invalid.
                    </Text>
                    <PressScale onPress={() => router.back()} haptic="light" style={{ marginTop: 24 }}>
                        <View style={[styles.ghostBtn, { borderColor: c.border }]}>
                            <Text style={{ color: c.primary, fontSize: 15, fontWeight: '600' }}>Go Back</Text>
                        </View>
                    </PressScale>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={c.bg as any} style={styles.flex}>
            {/* ── Nav ── */}
            <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
                <PressScale onPress={() => router.back()} haptic="light" accessibilityRole="button" accessibilityLabel="Go back">
                    <View style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                        <Ionicons name="chevron-back" size={20} color={c.text} />
                    </View>
                </PressScale>
                <View style={styles.navTitleRow}>
                    <Text style={styles.navEmoji}>{cfg.emoji}</Text>
                    <Text style={[styles.navTitle, { color: c.text }]}>{cfg.label}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
                showsVerticalScrollIndicator={false}
                bounces
            >
                {/* ── Hero Card (tag-type specific) ── */}
                {tagType === 'vehicle' && <VehicleHeroCard tag={tag} colors={c} />}
                {tagType === 'kids' && <KidsHeroCard tag={tag} colors={c} />}
                {tagType === 'pet' && <PetHeroCard tag={tag} colors={c} />}

                {/* ── Tag-Type Sections ── */}
                {tagType === 'kids' && <KidsSections tag={tag} handleToggle={handleToggle} c={c} />}
                {tagType === 'pet' && <PetsSections tag={tag} handleToggle={handleToggle} c={c} />}
                {tagType === 'vehicle' && <VehicleSections tag={tag} handleToggle={handleToggle} c={c} />}

                {/* ── Owner Actions (shared) ── */}
                {isOwner && (
                    <>
                        <SectionHeader label="Manage Tag" icon="settings-outline" colors={c} />
                        <CtaButton
                            label="Edit Tag Details"
                            icon="create-outline"
                            variant="primary"
                            onPress={() => router.push({ pathname: '/tag/edit-[id]' as any, params: { id: tag._id } })}
                            colors={c}
                        />
                        <CtaButton label="Download eTag PDF" icon="download-outline" variant="outline" onPress={() => { }} colors={c} />
                        <CtaButton label="Deactivate Tag" icon="power-outline" variant="danger" onPress={() => { }} colors={c} />
                    </>
                )}

                {/* ── Scan History (shared) ── */}
                <SectionHeader label={`${cfg.scanLabel} (${tag.scans?.length ?? 0})`} icon="time-outline" colors={c} />

                {tag.scans?.length > 0 ? (
                    <View style={styles.timeline}>
                        {tag.scans.map((scan: any, index: number) => (
                            <ScanRow
                                key={`${scan.timestamp}-${index}`}
                                scan={scan}
                                isLast={index === tag.scans.length - 1}
                                colors={c}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                        <View style={[styles.emptyIcon, { backgroundColor: c.primaryBg }]}>
                            <Text style={{ fontSize: 28 }}>
                                {tagType === 'kids' ? '🔍' : tagType === 'pet' ? '🐾' : '📡'}
                            </Text>
                        </View>
                        <Text style={[styles.emptyTitle, { color: c.text }]}>No {cfg.scanLabel} Yet</Text>
                        <Text style={[styles.emptySub, { color: c.muted }]}>
                            {tagType === 'kids'
                                ? "When someone scans your child's tag, each check-in will appear here."
                                : tagType === 'pet'
                                    ? 'When someone scans your pet\'s tag, each sighting will appear here.'
                                    : 'When someone scans your vehicle tag, each event will appear here.'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

// ─── Global Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1 },

    // Nav
    navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    navTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    navEmoji: { fontSize: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    navTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.4 },

    // Content
    content: { paddingHorizontal: 20 },

    // Hero
    heroCard: { borderRadius: 26, borderWidth: 1, padding: 28, alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 6 },
    statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20, gap: 4 },
    statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    vehicleIcon: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
    nickname: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
    tagCode: { fontSize: 12, fontWeight: '500', marginTop: 4, letterSpacing: 0.5 },
    statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, marginTop: 24, paddingTop: 22 },
    statDivider: { width: 1, height: '70%', alignSelf: 'center' },

    // Timeline
    timeline: { paddingLeft: 4 },

    // Empty
    emptyState: { borderRadius: 22, borderWidth: 1, padding: 32, alignItems: 'center' },
    emptyIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    // Not-found state
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 10 },
    stateIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    stateTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, textAlign: 'center' },
    stateSub: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
    ghostBtn: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center' },
});