/**
 * PetScanView — Elite Pets Tag Redesign
 *
 * ─── Design Philosophy ───────────────────────────────────────────────────────
 *
 * Aesthetic direction: "Golden Hour Warmth"
 *   A found-pet screen should feel like a warm embrace — reassuring to whoever
 *   scanned the tag, and beautiful enough that owners feel pride sharing it.
 *
 * One unforgettable thing:
 *   The pet avatar floats inside a softly pulsing amber corona — as if the tag
 *   itself is alive and grateful you stopped to help.
 *
 * Hierarchy (in reading order):
 *   1. Pet identity  → name, avatar, breed              (emotional connection)
 *   2. Safety signal → "owner notified" confirmation    (trust, reassurance)
 *   3. Actions       → WhatsApp, Call Vet               (utility, purpose)
 *
 * Palette:
 *   Background  #FDF8F0  — warm cream
 *   Hero        #C2410C→#EA580C→#FED7AA  — terracotta sunrise
 *   Surface     #FFFFFF  — clean card
 *   Accent      #F59E0B  — amber
 *   Green       #16A34A  — WhatsApp (kept exact for brand trust)
 *   Text        #1C0A00  — very dark brown (not black — warmer)
 *   Muted       #92400E  — warm taupe
 *
 * Micro-interactions:
 *   • Avatar corona: loop pulse (scale + opacity) — Animated, native driver
 *   • Action buttons: spring scale on press
 *   • Notification pill: fade-in on mount
 *   • Content area: staggered fade-up on mount
 *
 * All animations use useNativeDriver: true where possible.
 * JS driver only for interpolations that require it (none here).
 */

import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { DomainTheme } from '../../theme/domainThemes';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const PALETTE = {
  bg: '#FDF8F0',
  heroTop: '#7C2D12',
  heroMid: '#C2410C',
  heroBot: '#FED7AA',
  surface: '#FFFFFF',
  amber: '#F59E0B',
  amberLight: 'rgba(245,158,11,0.15)',
  amberGlow: 'rgba(245,158,11,0.35)',
  green: '#16A34A',
  greenBrand: '#25D366',
  greenBg: 'rgba(22,163,74,0.1)',
  textDark: '#1C0A00',
  textMid: '#92400E',
  textLight: '#D97706',
  textOnHero: '#FFF',
  textOnHeroMuted: 'rgba(255,255,255,0.78)',
  border: 'rgba(194,65,12,0.12)',
  cardBorder: 'rgba(245,158,11,0.2)',
  divider: '#FEF3C7',
  notifiedBg: 'rgba(22,163,74,0.08)',
  notifiedBorder: 'rgba(22,163,74,0.25)',
} as const;

const U = 8;
const sp = (n: number) => U * n;

const R = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
  '3xl': 48,
  full: 9999,
} as const;

const SHADOW_SM = Platform.select({
  ios: { shadowColor: '#92400E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
  android: { elevation: 3 },
});

const SHADOW_MD = Platform.select({
  ios: { shadowColor: '#92400E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 14 },
  android: { elevation: 6 },
});

const SHADOW_LG = Platform.select({
  ios: { shadowColor: '#1C0A00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24 },
  android: { elevation: 12 },
});

// ─── Utility: Mount Animation ─────────────────────────────────────────────────

function useFadeUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 500, delay, useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, speed: 18, bounciness: 6, delay, useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── Pulsing Corona ───────────────────────────────────────────────────────────
/**
 * Soft ambient glow ring around the pet avatar.
 * Layers two rings at different phases to create a breathing effect.
 * Native driver — zero JS overhead.
 */
const CoronaRing = memo(({ size, delay = 0 }: { size: number; delay?: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1600, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0.5] });

  return (
    <Animated.View
      style={[
        coronaS.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
});

const coronaS = StyleSheet.create({
  ring: {
    position: 'absolute',
    backgroundColor: PALETTE.amberGlow,
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.4)',
  },
});

// ─── Pet Avatar ───────────────────────────────────────────────────────────────

const PetAvatar = memo(({ petName }: { petName: string }) => {
  // Derive a consistent "initial" for the avatar
  const initial = petName?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <View style={avatarS.wrapper}>
      {/* Outer corona — slow */}
      <CoronaRing size={192} delay={0} />
      {/* Inner corona — faster phase */}
      <CoronaRing size={168} delay={600} />

      {/* Avatar shell */}
      <View style={avatarS.shell}>
        {/* Paw icon background watermark */}
        <View style={avatarS.pawWatermark}>
          <Ionicons name="paw" size={64} color="rgba(245,158,11,0.18)" />
        </View>
        {/* Initial */}
        <Text style={avatarS.initial} accessibilityLabel={`Pet initial: ${initial}`}>
          {initial}
        </Text>
      </View>
    </View>
  );
});

const avatarS = StyleSheet.create({
  wrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFBEB',
    borderWidth: 4,
    borderColor: PALETTE.amber,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOW_LG,
  },
  pawWatermark: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  initial: {
    fontSize: 56,
    fontWeight: '800',
    color: PALETTE.textMid,
    includeFontPadding: false,
  },
});

// ─── Hero Banner ──────────────────────────────────────────────────────────────
/**
 * Terracotta sunrise gradient — warm and inviting.
 * The avatar "breaks out" of the bottom edge via negative margin on the content
 * below, creating an organic layered depth effect without absolute positioning hacks.
 */
const HeroBanner = memo(({ petName, breedInfo }: { petName: string; breedInfo?: string }) => {
  const slideDown = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideDown, { toValue: 0, speed: 14, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={heroS.root}>
      {/* Layered gradient via stacked views (LinearGradient not assumed available) */}
      <View style={[StyleSheet.absoluteFill, heroS.gradTop]} />
      <View style={[StyleSheet.absoluteFill, heroS.gradBot]} />

      {/* Organic blob decorations */}
      <View style={heroS.blob1} />
      <View style={heroS.blob2} />
      <View style={heroS.blob3} />

      <Animated.View style={[heroS.content, { opacity, transform: [{ translateY: slideDown }] }]}>
        <PetAvatar petName={petName} />

        {/* "Found Pet" pill — shown before we know the name */}
        {!petName && (
          <View style={heroS.foundPill}>
            <Ionicons name="paw" size={12} color={PALETTE.amber} />
            <Text style={heroS.foundPillText}>Found Pet</Text>
          </View>
        )}

        <Text style={heroS.petName} accessibilityRole="header">
          {petName || 'Found Pet'}
        </Text>

        {breedInfo ? (
          <View style={heroS.breedRow}>
            <Ionicons name="ribbon-outline" size={13} color={PALETTE.textOnHeroMuted} />
            <Text style={heroS.petBreed}>{breedInfo}</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Bottom wave cutout — achieved with a large borderRadius on the inner scallop */}
      <View style={heroS.scallop} />
    </View>
  );
});

const heroS = StyleSheet.create({
  root: {
    backgroundColor: PALETTE.heroMid,
    paddingTop: 64,
    paddingBottom: 72,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradTop: {
    backgroundColor: PALETTE.heroTop,
    opacity: 0.7,
  },
  gradBot: {
    top: '40%',
    backgroundColor: PALETTE.heroMid,
    opacity: 0.5,
  },
  blob1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -60,
  },
  blob2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(245,158,11,0.12)', bottom: 20, left: -30,
  },
  blob3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)', top: 30, left: 30,
  },
  content: { alignItems: 'center', gap: sp(1.5), paddingHorizontal: sp(3) },
  foundPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: sp(1.5), paddingVertical: 5,
    borderRadius: R.full,
  },
  foundPillText: { fontSize: 12, fontWeight: '700', color: PALETTE.textOnHero, letterSpacing: 0.5 },
  petName: {
    fontSize: 36, fontWeight: '900', color: PALETTE.textOnHero,
    textAlign: 'center', letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  petBreed: {
    fontSize: 15, fontWeight: '500', color: PALETTE.textOnHeroMuted, letterSpacing: 0.2,
  },
  breedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  // Scallop creates the organic wave at the bottom of the hero
  scallop: {
    position: 'absolute', bottom: -36, left: -20, right: -20,
    height: 72, backgroundColor: PALETTE.bg, borderRadius: R['3xl'],
  },
});

// ─── Owner Notified Banner ────────────────────────────────────────────────────
/**
 * [OPTIONAL ENHANCEMENT — clearly marked]
 *
 * This component didn't exist in v1. Added because:
 *   The scan notification is the most emotionally significant event on this screen.
 *   The original version buried it as a muted footnote. Making it a prominent
 *   trust signal immediately reassures the finder: "you did the right thing."
 */
const OwnerNotifiedBanner = memo(() => {
  const style = useFadeUp(400);

  return (
    <Animated.View style={[notifS.root, style]}>
      <View style={notifS.iconWrap}>
        <Ionicons name="checkmark-circle" size={22} color={PALETTE.green} />
      </View>
      <View style={notifS.textBlock}>
        <Text style={notifS.title}>Owner Notified</Text>
        <Text style={notifS.sub}>
          The pet owner has been alerted to your location scan. They're on their way!
        </Text>
      </View>
    </Animated.View>
  );
});

const notifS = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: PALETTE.notifiedBg,
    borderWidth: 1, borderColor: PALETTE.notifiedBorder,
    borderRadius: R.lg, padding: sp(2), gap: sp(1.5),
    ...SHADOW_SM,
  },
  iconWrap: { marginTop: 1 },
  textBlock: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontWeight: '800', color: PALETTE.green, letterSpacing: -0.1 },
  sub: { fontSize: 12, fontWeight: '500', color: '#166534', lineHeight: 17, opacity: 0.85 },
});

// ─── Action Button ────────────────────────────────────────────────────────────
/**
 * Spring-scale press animation — feels tactile and alive.
 * Each variant has a distinct color personality:
 *   WhatsApp → brand green (globally recognized, high trust)
 *   Vet      → warm amber (care, warmth — not clinical blue)
 */

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  delay?: number;
  accessibilityLabel: string;
}

const ActionBtn = memo(({
  icon, label, sublabel, color, bgColor, onPress, delay = 0, accessibilityLabel,
}: ActionBtnProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const mountStyle = useFadeUp(delay);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 400, bounciness: 0 }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 200, bounciness: 8 }).start();
  }, []);

  return (
    <Animated.View style={[mountStyle, { transform: [...(mountStyle.transform as any), { scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[actionS.btn, { backgroundColor: bgColor, borderColor: color + '30' }]}
      >
        {/* Icon container */}
        <View style={[actionS.iconCircle, { backgroundColor: color }]}>
          {icon}
        </View>

        {/* Text block */}
        <View style={actionS.textBlock}>
          <Text style={[actionS.label, { color: PALETTE.textDark }]}>{label}</Text>
          {sublabel ? (
            <Text style={[actionS.sublabel, { color: PALETTE.textMid }]}>{sublabel}</Text>
          ) : null}
        </View>

        {/* Chevron */}
        <View style={[actionS.chevronWrap, { backgroundColor: color + '18' }]}>
          <Ionicons name="chevron-forward" size={16} color={color} />
        </View>
      </Pressable>
    </Animated.View>
  );
});

const actionS = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: R.xl, borderWidth: 1,
    padding: sp(2), gap: sp(1.75),
    ...SHADOW_MD,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: { flex: 1, gap: 3 },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sublabel: { fontSize: 12, fontWeight: '500', opacity: 0.75 },
  chevronWrap: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
});

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel = memo(({ text, delay = 0 }: { text: string; delay?: number }) => {
  const style = useFadeUp(delay);
  return (
    <Animated.View style={[sectionS.root, style]}>
      <View style={sectionS.dot} />
      <Text style={sectionS.text}>{text}</Text>
      <View style={sectionS.line} />
    </Animated.View>
  );
});

const sectionS = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.amber },
  text: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: PALETTE.textLight, textTransform: 'uppercase' },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: PALETTE.cardBorder },
});

// ─── Pet ID Card ──────────────────────────────────────────────────────────────
/**
 * [OPTIONAL ENHANCEMENT — clearly marked]
 *
 * Shows key safety info at a glance. Reads like a slim ID card.
 * Helps the finder know what they're dealing with before calling.
 */
const PetIdCard = memo(({ payload, delay = 0 }: { payload: any; delay?: number }) => {
  const style = useFadeUp(delay);

  const fields: { icon: string; label: string; value: string }[] = [
    payload.microchipId && { icon: 'barcode-outline', label: 'Microchip', value: payload.microchipId },
    payload.medicalNotes && { icon: 'medkit-outline', label: 'Medical', value: payload.medicalNotes },
    payload.ownerCity && { icon: 'location-outline', label: 'Home area', value: payload.ownerCity },
  ].filter(Boolean) as any[];

  if (!fields.length) return null;

  return (
    <Animated.View style={[idCardS.root, style]}>
      {fields.map((f, i) => (
        <React.Fragment key={f.label}>
          <View style={idCardS.row}>
            <View style={idCardS.iconWrap}>
              <Ionicons name={f.icon as any} size={15} color={PALETTE.textLight} />
            </View>
            <View style={idCardS.fieldText}>
              <Text style={idCardS.fieldLabel}>{f.label}</Text>
              <Text style={idCardS.fieldValue}>{f.value}</Text>
            </View>
          </View>
          {i < fields.length - 1 && <View style={idCardS.divider} />}
        </React.Fragment>
      ))}
    </Animated.View>
  );
});

const idCardS = StyleSheet.create({
  root: {
    backgroundColor: PALETTE.surface,
    borderRadius: R.xl, borderWidth: 1, borderColor: PALETTE.cardBorder,
    overflow: 'hidden', ...SHADOW_SM,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp(1.5), padding: sp(2) },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: PALETTE.amberLight,
    justifyContent: 'center', alignItems: 'center',
  },
  fieldText: { gap: 2 },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: PALETTE.textLight, textTransform: 'uppercase' },
  fieldValue: { fontSize: 14, fontWeight: '600', color: PALETTE.textDark },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: PALETTE.divider, marginLeft: sp(2) + 36 + sp(1.5) },
});

// ─── Gratitude Footer ─────────────────────────────────────────────────────────

const GratitudeFooter = memo(({ delay = 0 }: { delay?: number }) => {
  const style = useFadeUp(delay);
  return (
    <Animated.View style={[footerS.root, style]}>
      <Text style={footerS.heart}>🐾</Text>
      <Text style={footerS.text}>
        Thank you for taking the time to help. You're making a pet parent very happy.
      </Text>
    </Animated.View>
  );
});

const footerS = StyleSheet.create({
  root: {
    alignItems: 'center', gap: sp(1),
    paddingHorizontal: sp(3), paddingVertical: sp(2),
  },
  heart: { fontSize: 22 },
  text: {
    fontSize: 13, fontWeight: '500', color: PALETTE.textMid,
    textAlign: 'center', lineHeight: 20, opacity: 0.8,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function PetScanView({ payload }: { payload: any }) {
  const theme = useTheme() as DomainTheme;

  if (!payload) return null;

  // Extract actions from payload — same as original logic
  const whatsappAction = payload.actionsAvailable?.find(
    (a: any) => a.actionType === 'WHATSAPP_OWNER'
  );
  const callVetAction = payload.actionsAvailable?.find(
    (a: any) => a.actionType === 'CALL_VET'
  );

  const handleWhatsapp = useCallback(() => {
    // Original action handler slot — backend logic unchanged
    whatsappAction?.onPress?.();
  }, [whatsappAction]);

  const handleCallVet = useCallback(() => {
    callVetAction?.onPress?.();
  }, [callVetAction]);

  const hasActions = whatsappAction || callVetAction;
  const hasIdFields = payload.microchipId || payload.medicalNotes || payload.ownerCity;

  return (
    <ScrollView
      style={screenS.root}
      contentContainerStyle={screenS.content}
      bounces={false}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Found pet information screen"
    >
      {/* ── Hero ── */}
      <HeroBanner
        petName={payload.petName || ''}
        breedInfo={payload.breedInfo}
      />

      {/* ── Body ── */}
      <View style={screenS.body}>

        {/* Owner notified trust signal */}
        <OwnerNotifiedBanner />

        {/* Pet ID card — optional fields */}
        {hasIdFields && (
          <>
            <SectionLabel text="Pet Profile" delay={300} />
            <PetIdCard payload={payload} delay={350} />
          </>
        )}

        {/* Actions section */}
        {hasActions && (
          <>
            <SectionLabel text="Contact" delay={500} />

            {whatsappAction && (
              <ActionBtn
                icon={<Ionicons name="logo-whatsapp" size={26} color="#FFF" />}
                label="WhatsApp Owner"
                sublabel="Chat directly with the pet parent"
                color={PALETTE.greenBrand}
                bgColor="#F0FDF4"
                onPress={handleWhatsapp}
                delay={560}
                accessibilityLabel="Open WhatsApp to message the pet owner"
              />
            )}

            {callVetAction && (
              <ActionBtn
                icon={<FontAwesome5 name="clinic-medical" size={22} color="#FFF" />}
                label="Call Registered Vet"
                sublabel="Contact the pet's veterinarian"
                color={PALETTE.amber}
                bgColor="#FFFBEB"
                onPress={handleCallVet}
                delay={640}
                accessibilityLabel="Call the pet's registered veterinarian"
              />
            )}
          </>
        )}

        {/* Gratitude footer */}
        <GratitudeFooter delay={hasActions ? 720 : 500} />

      </View>
    </ScrollView>
  );
}

const screenS = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  content: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: sp(3),
    paddingTop: sp(4),
    paddingBottom: sp(6),
    gap: sp(2.5),
  },
});