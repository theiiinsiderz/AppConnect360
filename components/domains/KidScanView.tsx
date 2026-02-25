/**
 * KidScanView — "Soft Storybook" Edition
 *
 * Design Direction: Warm, rounded, storybook-illustrated UI.
 * Feels like a hug. Safe for kids. Trusted by parents.
 *
 * Palette: Sky-blue primary · Coral accent · Mint action · Amber alert
 * Typography: Rounded, large-scale, high-legibility
 * Motion: Gentle bounce-ins, no harsh flashes, no rapid transitions
 * Safety: No red primary actions · All touch targets ≥ 48px
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Design Tokens ─────────────────────────────────────────────────────────────

const K = {
  // Colors — soft, never harsh
  sky: '#5BB8F5',         // primary
  skyLight: '#E8F5FF',    // primary bg
  skyDark: '#3A9DE8',     // primary pressed
  coral: '#FF7B6B',       // accent (calls, actions)
  coralLight: '#FFF0EE',  // accent bg
  mint: '#48D9A4',        // positive actions
  mintLight: '#E6FBF4',   // mint bg
  amber: '#F5A623',       // medical alert (warm, not red)
  amberLight: '#FFF8EC',  // amber bg
  lavender: '#9B8EC4',    // secondary accent
  lavenderLight: '#F0EEFF', // lavender bg
  white: '#FFFFFF',
  cloud: '#F7FBFF',       // off-white background tint
  parchment: '#FEFDF9',   // warm off-white
  text: '#1A2B45',        // deep navy (not pure black)
  subtext: '#5A7090',     // medium blue-grey
  muted: '#94A8C0',       // light blue-grey
  border: 'rgba(91,184,245,0.18)',
  shadow: 'rgba(91,184,245,0.22)',

  // Spacing
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s40: 40,
  s48: 48,

  // Radii
  rPill: 9999,
  rCard: 28,
  rButton: 20,
  rAvatar: 9999,
  rTag: 14,

  // Typography sizes
  tHero: 34,
  tTitle: 22,
  tBody: 16,
  tCaption: 13,

  // Motion
  springFast: { tension: 80, friction: 8, useNativeDriver: true } as const,
  springBounce: { tension: 60, friction: 6, useNativeDriver: true } as const,
} as const;

// ─── Animated Entry Helper ─────────────────────────────────────────────────────

function useFadeSlideIn(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 420, delay,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, delay, useNativeDriver: true,
        tension: 70, friction: 9,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

function useBounceIn(delay = 0) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, tension: 55, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  }, []);

  return { opacity, transform: [{ scale }] };
}

// ─── Press Scale Button ────────────────────────────────────────────────────────

function BounceButton({
  children, onPress, style, accessibilityLabel, disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 80, friction: 6 }).start();
    }
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 5 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Floating Decoration Dots (optional whimsy) ────────────────────────────────

function DecorDots() {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, dur: number, offset: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: offset, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    };
    loop(float1, 2800, -6);
    loop(float2, 3400, 8);
  }, []);

  return (
    <View style={decor.container} pointerEvents="none">
      <Animated.View style={[decor.dot, decor.dot1, { transform: [{ translateY: float1 }] }]} />
      <Animated.View style={[decor.dot, decor.dot2, { transform: [{ translateY: float2 }] }]} />
      <Animated.View style={[decor.dot, decor.dot3, { transform: [{ translateY: float1 }] }]} />
      <View style={[decor.star, decor.star1]}><Text style={{ fontSize: 16 }}>⭐</Text></View>
      <View style={[decor.star, decor.star2]}><Text style={{ fontSize: 12 }}>✨</Text></View>
    </View>
  );
}

const decor = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, overflow: 'hidden' },
  dot: { position: 'absolute', borderRadius: K.rPill },
  dot1: { width: 64, height: 64, backgroundColor: 'rgba(91,184,245,0.12)', top: 40, right: -12 },
  dot2: { width: 40, height: 40, backgroundColor: 'rgba(72,217,164,0.14)', top: 120, left: -10 },
  dot3: { width: 24, height: 24, backgroundColor: 'rgba(155,142,196,0.18)', top: 200, right: 32 },
  star: { position: 'absolute' },
  star1: { top: 56, left: 28 },
  star2: { top: 180, right: 56 },
});

// ─── Avatar Component ──────────────────────────────────────────────────────────

function KidAvatar({ emoji, color }: { emoji?: string; color: string }) {
  const anim = useBounceIn(100);
  return (
    <Animated.View style={[anim, av.outerRing, { borderColor: color + '30', backgroundColor: color + '12' }]}>
      <View style={[av.middleRing, { backgroundColor: color + '20', borderColor: color + '25' }]}>
        <LinearGradient
          colors={[color + 'EE', color + 'BB']}
          style={av.inner}
        >
          <Text style={av.emoji}>{emoji || '🧒'}</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const av = StyleSheet.create({
  outerRing: { width: 148, height: 148, borderRadius: 74, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: K.s24 },
  middleRing: { width: 124, height: 124, borderRadius: 62, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  inner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 52 },
});

// ─── Name Badge ────────────────────────────────────────────────────────────────

function NameBadge({ name }: { name: string }) {
  const anim = useFadeSlideIn(220);
  return (
    <Animated.View style={anim}>
      <Text style={nb.greeting}>Hi there! 👋</Text>
      <Text style={nb.name} accessibilityRole="header">I'm {name}!</Text>
    </Animated.View>
  );
}

const nb = StyleSheet.create({
  greeting: { fontSize: 18, color: K.subtext, textAlign: 'center', fontWeight: '600', marginBottom: K.s4, letterSpacing: 0.2 },
  name: { fontSize: K.tHero, fontWeight: '900', color: K.text, textAlign: 'center', letterSpacing: -0.5, lineHeight: 42 },
});

// ─── Medical Alert Card ────────────────────────────────────────────────────────

function MedicalAlertCard({ alert }: { alert: string }) {
  const anim = useFadeSlideIn(340);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[anim, { transform: [{ scale: pulse }] }]}>
      <View style={ma.card} accessibilityRole="alert" accessibilityLabel={`Medical Alert: ${alert}`}>
        <LinearGradient colors={[K.amberLight, '#FFF3E0']} style={ma.gradient}>
          <View style={ma.iconWrap}>
            <Text style={{ fontSize: 28 }}>🏥</Text>
          </View>
          <View style={ma.textCol}>
            <Text style={ma.label}>Medical Alert</Text>
            <Text style={ma.body}>{alert}</Text>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const ma = StyleSheet.create({
  card: { borderRadius: K.rCard, overflow: 'hidden', marginBottom: K.s20, borderWidth: 1.5, borderColor: K.amber + '55', shadowColor: K.amber, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  gradient: { flexDirection: 'row', alignItems: 'center', padding: K.s20 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: K.amber + '22', justifyContent: 'center', alignItems: 'center', marginRight: K.s16 },
  textCol: { flex: 1 },
  label: { fontSize: K.tCaption, fontWeight: '800', color: K.amber, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  body: { fontSize: K.tBody, fontWeight: '700', color: '#7A4800', lineHeight: 22 },
});

// ─── Safe Info Card ────────────────────────────────────────────────────────────

function SafeInfoCard({ label, value, emoji, delay = 0 }: { label: string; value: string; emoji: string; delay?: number }) {
  const anim = useFadeSlideIn(delay);
  return (
    <Animated.View style={[anim, si.card]}>
      <Text style={si.emoji}>{emoji}</Text>
      <View style={si.textCol}>
        <Text style={si.label}>{label}</Text>
        <Text style={si.value}>{value}</Text>
      </View>
    </Animated.View>
  );
}

const si = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: K.white, borderRadius: K.rTag + 4, padding: K.s16, marginBottom: K.s12, borderWidth: 1, borderColor: K.border, shadowColor: K.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  emoji: { fontSize: 28, marginRight: K.s16, width: 40, textAlign: 'center' },
  textCol: { flex: 1 },
  label: { fontSize: K.tCaption, fontWeight: '700', color: K.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  value: { fontSize: K.tBody, fontWeight: '700', color: K.text },
});

// ─── Action Button: Guardian Call ─────────────────────────────────────────────

function GuardianCallButton({ action, delay = 0 }: { action: any; delay?: number }) {
  const anim = useFadeSlideIn(delay);
  return (
    <Animated.View style={anim}>
      <BounceButton
        onPress={() => { /* call logic handled externally */ }}
        accessibilityLabel="Call guardian for help"
        style={{ marginBottom: K.s16 }}
      >
        <LinearGradient
          colors={[K.coral, '#FF6B58']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={gcb.btn}
        >
          <View style={gcb.iconWrap}>
            <Text style={{ fontSize: 28 }}>📞</Text>
          </View>
          <View style={gcb.textCol}>
            <Text style={gcb.primary}>Call for Help</Text>
            <Text style={gcb.secondary}>Contact my guardian</Text>
          </View>
          <View style={gcb.arrow}>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </BounceButton>
    </Animated.View>
  );
}

const gcb = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', borderRadius: K.rButton + 4, padding: K.s20, minHeight: 80, shadowColor: K.coral, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginRight: K.s16 },
  textCol: { flex: 1 },
  primary: { fontSize: K.tTitle, fontWeight: '900', color: K.white, letterSpacing: -0.3 },
  secondary: { fontSize: K.tCaption, color: 'rgba(255,255,255,0.82)', marginTop: 3, fontWeight: '500' },
  arrow: { marginLeft: K.s8 },
});

// ─── Action Button: WhatsApp / SMS ────────────────────────────────────────────

function MessageButton({ label, emoji, color, delay = 0 }: { label: string; emoji: string; color: string; delay?: number }) {
  const anim = useFadeSlideIn(delay);
  return (
    <Animated.View style={[anim, { flex: 1 }]}>
      <BounceButton
        onPress={() => { }}
        accessibilityLabel={label}
        style={{ flex: 1 }}
      >
        <View style={[mb.btn, { backgroundColor: color + '14', borderColor: color + '35' }]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</Text>
          <Text style={[mb.label, { color }]}>{label}</Text>
        </View>
      </BounceButton>
    </Animated.View>
  );
}

const mb = StyleSheet.create({
  btn: { borderRadius: K.rCard - 4, borderWidth: 1.5, padding: K.s16, alignItems: 'center', minHeight: 84, justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '800', textAlign: 'center', letterSpacing: -0.2 },
});

// ─── Location Sharing Notice ───────────────────────────────────────────────────

function LocationNotice({ anim }: { anim: any }) {
  return (
    <Animated.View style={[anim, ln.wrap]}>
      <Text style={ln.emoji}>📍</Text>
      <Text style={ln.text}>
        Sharing your location helps the guardian find this child safely.
      </Text>
    </Animated.View>
  );
}

const ln = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: K.skyLight, borderRadius: K.rTag, padding: K.s16, borderWidth: 1, borderColor: K.sky + '35', marginTop: K.s8 },
  emoji: { fontSize: 18, marginRight: K.s12, marginTop: 1 },
  text: { flex: 1, fontSize: 13, color: K.subtext, lineHeight: 19, fontWeight: '500' },
});

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  const anim = useFadeSlideIn(delay);
  return (
    <Animated.View style={[anim, sl.wrap]}>
      <View style={[sl.line, { flex: 1 }]} />
      <Text style={sl.text}>{label}</Text>
      <View style={[sl.line, { flex: 1 }]} />
    </Animated.View>
  );
}

const sl = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: K.s12, marginVertical: K.s20 },
  line: { height: 1.5, backgroundColor: K.border, borderRadius: 1 },
  text: { fontSize: K.tCaption, fontWeight: '800', color: K.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
});

// ─── Safe Reminder Footer ─────────────────────────────────────────────────────

function SafetyFooter({ anim }: { anim: any }) {
  return (
    <Animated.View style={[anim, sf.wrap]}>
      <LinearGradient colors={[K.mintLight, '#E0FAF2']} style={sf.card}>
        <Text style={sf.emoji}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={sf.title}>You're helping!</Text>
          <Text style={sf.body}>
            Scanning this tag connects this child with their family. Thank you for being kind.
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const sf = StyleSheet.create({
  wrap: { marginTop: K.s8 },
  card: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: K.rCard, padding: K.s20, gap: K.s16, borderWidth: 1, borderColor: K.mint + '40' },
  emoji: { fontSize: 32, marginTop: 2 },
  title: { fontSize: 16, fontWeight: '800', color: '#0A6B4C', marginBottom: 4 },
  body: { fontSize: 13, color: '#2A8060', lineHeight: 19, fontWeight: '500' },
});

// ─── Empty / Loading States ────────────────────────────────────────────────────

function EmptyPayload() {
  const anim = useBounceIn(0);
  return (
    <View style={ep.wrap}>
      <Animated.View style={[anim, ep.card]}>
        <Text style={{ fontSize: 64, marginBottom: K.s24 }}>🏷️</Text>
        <Text style={ep.title}>Tag not found</Text>
        <Text style={ep.body}>
          This tag doesn't seem to have any info yet. Ask a parent or guardian to set it up!
        </Text>
      </Animated.View>
    </View>
  );
}

const ep = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: K.s32 },
  card: { backgroundColor: K.white, borderRadius: K.rCard, padding: K.s32, alignItems: 'center', shadowColor: K.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5, maxWidth: 340 },
  title: { fontSize: K.tTitle, fontWeight: '900', color: K.text, textAlign: 'center', marginBottom: K.s12 },
  body: { fontSize: K.tBody, color: K.subtext, textAlign: 'center', lineHeight: 24 },
});

// ─── Main Component ────────────────────────────────────────────────────────────

export function KidScanView({ payload }: { payload: any }) {
  const insets = useSafeAreaInsets();

  // Announcement for screen readers
  useEffect(() => {
    if (payload?.displayName) {
      AccessibilityInfo.announceForAccessibility(
        `Tag belongs to ${payload.displayName}. ${payload.medicalAlerts ? `Medical alert: ${payload.medicalAlerts}.` : ''} Use the buttons below to contact the guardian.`
      );
    }
  }, [payload]);

  if (!payload) return <EmptyPayload />;

  const hasCall = payload.actionsAvailable?.some((a: any) => a.actionType === 'CALL_PRIMARY_GUARDIAN');
  const hasWhatsapp = payload.actionsAvailable?.some((a: any) => a.actionType === 'WHATSAPP');
  const hasSms = payload.actionsAvailable?.some((a: any) => a.actionType === 'SMS');
  const requiresLocation = payload.actionsAvailable?.some((a: any) => a.requiresLocationShare);

  const footerAnim = useFadeSlideIn(640);
  const locationAnim = useFadeSlideIn(560);

  // Pick avatar color & emoji based on payload hints
  const avatarColor = payload.avatarColor || K.sky;
  const avatarEmoji = payload.avatarEmoji || (payload.gender === 'girl' ? '👧' : '🧒');

  return (
    <LinearGradient
      colors={[K.cloud, '#EFF8FF', K.parchment]}
      style={main.flex}
    >
      {/* Decorative ambient dots */}
      <DecorDots />

      <ScrollView
        contentContainerStyle={[
          main.scroll,
          { paddingTop: insets.top + K.s16, paddingBottom: insets.bottom + K.s48 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        accessibilityRole="scrollbar"
      >
        {/* ── Hero ── */}
        <View style={main.hero}>
          <KidAvatar emoji={avatarEmoji} color={avatarColor} />
          <NameBadge name={payload.displayName || 'A Friend'} />

          {/* Age / Grade chip */}
          {(payload.age || payload.grade) ? (
            <View style={main.chip}>
              <Text style={main.chipText}>
                {[payload.age ? `Age ${payload.age}` : null, payload.grade].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Medical Alert (priority) ── */}
        {payload.medicalAlerts ? (
          <MedicalAlertCard alert={payload.medicalAlerts} />
        ) : null}

        {/* ── Quick Info ── */}
        {(payload.school || payload.bloodGroup || payload.allergies) && (
          <>
            <SectionLabel label="About me" delay={300} />
            {payload.school && (
              <SafeInfoCard emoji="🏫" label="My School" value={payload.school} delay={360} />
            )}
            {payload.bloodGroup && (
              <SafeInfoCard emoji="🩸" label="Blood Group" value={payload.bloodGroup} delay={400} />
            )}
            {payload.allergies && (
              <SafeInfoCard emoji="⚠️" label="Allergies" value={payload.allergies} delay={440} />
            )}
          </>
        )}

        {/* ── Actions ── */}
        {payload.actionsAvailable?.length > 0 && (
          <>
            <SectionLabel label="Get in touch" delay={480} />

            {/* Primary: Guardian call */}
            {hasCall && (
              <GuardianCallButton
                action={payload.actionsAvailable.find((a: any) => a.actionType === 'CALL_PRIMARY_GUARDIAN')}
                delay={520}
              />
            )}

            {/* Secondary: WhatsApp + SMS side by side */}
            {(hasWhatsapp || hasSms) && (
              <View style={main.msgRow}>
                {hasWhatsapp && <MessageButton label="WhatsApp" emoji="💬" color="#25D366" delay={560} />}
                {hasSms && <MessageButton label="Send SMS" emoji="✉️" color={K.lavender} delay={580} />}
              </View>
            )}

            {/* Location notice */}
            {requiresLocation && <LocationNotice anim={locationAnim} />}
          </>
        )}

        {/* ── Safety Footer ── */}
        <SafetyFooter anim={footerAnim} />

      </ScrollView>
    </LinearGradient>
  );
}

// ─── Screen-Level Styles ───────────────────────────────────────────────────────

const main = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: K.s20 },

  hero: { alignItems: 'center', marginBottom: K.s8 },

  chip: {
    marginTop: K.s12,
    backgroundColor: K.skyLight,
    borderRadius: K.rPill,
    paddingHorizontal: K.s16,
    paddingVertical: K.s8,
    borderWidth: 1,
    borderColor: K.sky + '40',
  },
  chipText: { fontSize: 14, fontWeight: '700', color: K.sky },

  msgRow: {
    flexDirection: 'row',
    gap: K.s12,
    marginBottom: K.s4,
  },
});