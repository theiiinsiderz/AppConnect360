/**
 * CarScanView — "Control Room" Edition
 *
 * Design Direction: Automotive HMI meets traffic authority dashboard.
 * Zero decoration. Maximum signal. Built for gloved hands and bright sunlight.
 *
 * Palette:   Graphite-900 bg · Electric-blue primary · Amber alert · Green verified
 * Typography: Tabular numerals · Tight tracking for plate IDs · High-contrast headers
 * Motion:    Entry slides only — functional, never decorative
 * Safety:    All targets ≥ 48px · Outdoor-contrast ratios · Screen-reader complete
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Design Tokens ─────────────────────────────────────────────────────────────

const V = {
  // Greys (base surface system)
  g950: '#0A0C10',
  g900: '#0F1117',
  g800: '#161B24',
  g700: '#1E2535',
  g600: '#2A3448',
  g500: '#3A4A60',
  g400: '#5A6E88',
  g300: '#8499B0',
  g200: '#B0BFD0',
  g100: '#D8E2EC',
  g50: '#EEF3F8',

  // Brand
  blue: '#1E6FFF',    // primary — electric blue
  blueDark: '#1558D6',    // pressed state
  blueLight: '#4D8FFF',    // lighter variant
  blueBg: 'rgba(30,111,255,0.10)',
  blueBorder: 'rgba(30,111,255,0.28)',

  // Semantic
  amber: '#F5A623',    // alert / warning
  amberBg: 'rgba(245,166,35,0.10)',
  amberBorder: 'rgba(245,166,35,0.30)',
  green: '#22C55E',    // verified / success
  greenBg: 'rgba(34,197,94,0.10)',
  greenBorder: 'rgba(34,197,94,0.25)',
  red: '#EF4444',    // critical alert
  redBg: 'rgba(239,68,68,0.10)',
  redBorder: 'rgba(239,68,68,0.28)',

  // Text
  textPrimary: '#F0F4FA',
  textSecondary: '#8499B0',
  textMuted: '#4A5A70',
  textOnBlue: '#FFFFFF',

  // Surfaces
  surfaceCard: 'rgba(255,255,255,0.04)',
  surfaceBorder: 'rgba(255,255,255,0.07)',
  divider: 'rgba(255,255,255,0.06)',

  // Spacing
  s4: 4, s6: 6, s8: 8, s10: 10,
  s12: 12, s14: 14, s16: 16, s18: 18, s20: 20, s24: 24,
  s28: 28, s32: 32, s40: 40, s48: 48,

  // Radii — crisp, not playful
  rCard: 14,
  rButton: 12,
  rTag: 8,
  rPlate: 6,

  // Typography
  tMono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
} as const;

// ─── Animation Helpers ─────────────────────────────────────────────────────────

function useFadeIn(delay = 0, duration = 300) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: duration + 60, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

// ─── Press Handler (functional, no spring theatrics) ──────────────────────────

function TapTarget({
  children, onPress, style, accessibilityLabel, accessibilityHint, disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.timing(opacity, { toValue: 0.75, duration: 80, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    }
  };
  const pressOut = () => Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();

  return (
    <Animated.View style={[{ opacity }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Indian Number Plate ───────────────────────────────────────────────────────

function NumberPlate({ registration }: { registration: string }) {
  return (
    <View style={plate.outer} accessibilityLabel={`Registration: ${registration}`}>
      {/* IND stripe */}
      <View style={plate.stripe}>
        <Text style={plate.stripeSymbol}>✦</Text>
        <Text style={plate.stripeText}>IND</Text>
      </View>
      {/* Number */}
      <View style={plate.numberWrap}>
        <Text style={plate.number} numberOfLines={1} adjustsFontSizeToFit>{registration}</Text>
      </View>
      {/* Bolt holes */}
      {[plate.bTL, plate.bTR, plate.bBL, plate.bBR].map((pos, i) => (
        <View key={i} style={[plate.bolt, pos]} />
      ))}
    </View>
  );
}

const plate = StyleSheet.create({
  outer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF9CC', borderRadius: V.rPlate,
    borderWidth: 2, borderColor: '#B8860B',
    overflow: 'hidden', minWidth: 260,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10, elevation: 6,
  },
  stripe: {
    width: 34, alignSelf: 'stretch', backgroundColor: '#003DA5',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 6,
  },
  stripeSymbol: { fontSize: 9, color: '#FFF', marginBottom: 1 },
  stripeText: { fontSize: 8, color: '#FFF', fontWeight: '900', letterSpacing: 0.8 },
  numberWrap: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' },
  number: {
    fontSize: 26, fontWeight: '900', letterSpacing: 5,
    color: '#111', fontFamily: V.tMono, textTransform: 'uppercase',
  },
  bolt: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.18)', borderWidth: 0.5, borderColor: '#999' },
  bTL: { top: 4, left: 38 }, bTR: { top: 4, right: 6 },
  bBL: { bottom: 4, left: 38 }, bBR: { bottom: 4, right: 6 },
});

// ─── Status Badge ──────────────────────────────────────────────────────────────

type StatusType = 'active' | 'inactive' | 'alert';

function StatusBadge({ status, label }: { status: StatusType; label: string }) {
  const map: Record<StatusType, { color: string; bg: string; border: string; icon: string }> = {
    active: { color: V.green, bg: V.greenBg, border: V.greenBorder, icon: 'checkmark-circle' },
    inactive: { color: V.g300, bg: V.surfaceCard, border: V.surfaceBorder, icon: 'ellipse-outline' },
    alert: { color: V.amber, bg: V.amberBg, border: V.amberBorder, icon: 'warning' },
  };
  const t = map[status];
  return (
    <View style={[sb.badge, { backgroundColor: t.bg, borderColor: t.border }]} accessibilityLabel={`Status: ${label}`}>
      <Ionicons name={t.icon as any} size={13} color={t.color} />
      <Text style={[sb.label, { color: t.color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: V.s6, paddingHorizontal: V.s12, paddingVertical: V.s6, borderRadius: V.rTag, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
});

// ─── Data Row ──────────────────────────────────────────────────────────────────

function DataRow({ label, value, icon, isLast, mono, valueColor }: {
  label: string; value: string; icon: string;
  isLast?: boolean; mono?: boolean; valueColor?: string;
}) {
  return (
    <View>
      <View style={row.wrap}>
        <View style={row.iconBox}>
          <Ionicons name={icon as any} size={16} color={V.g400} />
        </View>
        <View style={row.textCol}>
          <Text style={row.label}>{label}</Text>
          <Text style={[row.value, mono && { fontFamily: V.tMono, letterSpacing: 1.5 }, valueColor ? { color: valueColor } : {}]}>
            {value}
          </Text>
        </View>
      </View>
      {!isLast && <View style={row.divider} />}
    </View>
  );
}

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: V.s16, paddingVertical: V.s16 },
  iconBox: { width: 36, height: 36, borderRadius: V.rTag, backgroundColor: V.surfaceCard, justifyContent: 'center', alignItems: 'center', marginRight: V.s14 as any, borderWidth: 1, borderColor: V.surfaceBorder },
  textCol: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', color: V.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  value: { fontSize: 15, fontWeight: '600', color: V.textPrimary, letterSpacing: -0.2 },
  divider: { height: 1, backgroundColor: V.divider, marginLeft: 68 },
});

// ─── Section Block ─────────────────────────────────────────────────────────────

function SectionBlock({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[sect.wrap, style]}>
      <Text style={sect.header}>{label}</Text>
      <View style={sect.card}>{children}</View>
    </View>
  );
}

const sect = StyleSheet.create({
  wrap: { marginBottom: V.s20 },
  header: { fontSize: 10, fontWeight: '800', color: V.textMuted, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: V.s10, paddingHorizontal: 2 },
  card: { borderRadius: V.rCard, borderWidth: 1, borderColor: V.surfaceBorder, backgroundColor: V.surfaceCard, overflow: 'hidden' },
});

// ─── Primary Action: Call Owner ────────────────────────────────────────────────

function CallOwnerButton({ onPress }: { onPress?: () => void }) {
  return (
    <TapTarget onPress={onPress} accessibilityLabel="Call vehicle owner securely" accessibilityHint="Your number will be masked" style={{ marginBottom: V.s12 }}>
      <LinearGradient
        colors={[V.blue, V.blueDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={cob.btn}
      >
        <View style={cob.iconWrap}>
          <Ionicons name="call" size={22} color={V.textOnBlue} />
        </View>
        <View style={cob.textCol}>
          <Text style={cob.primary}>Call Owner Securely</Text>
          <Text style={cob.secondary}>Number masked · No personal data shared</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
      </LinearGradient>
    </TapTarget>
  );
}

const cob = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', borderRadius: V.rButton, paddingVertical: V.s18 as any, paddingHorizontal: V.s20, minHeight: 68, gap: V.s14 as any },
  iconWrap: { width: 44, height: 44, borderRadius: V.rButton - 2, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  textCol: { flex: 1 },
  primary: { fontSize: 16, fontWeight: '800', color: V.textOnBlue, letterSpacing: -0.2 },
  secondary: { fontSize: 12, color: 'rgba(255,255,255,0.68)', marginTop: 3, fontWeight: '500' },
});

// ─── Secondary Action: Report Parking ─────────────────────────────────────────

function ReportParkingButton({ onPress }: { onPress?: () => void }) {
  return (
    <TapTarget onPress={onPress} accessibilityLabel="Report a parking issue" style={{ marginBottom: V.s12 }}>
      <View style={rpb.btn}>
        <View style={[rpb.iconWrap, { backgroundColor: V.amberBg, borderColor: V.amberBorder }]}>
          <Ionicons name="warning-outline" size={20} color={V.amber} />
        </View>
        <View style={rpb.textCol}>
          <Text style={rpb.primary}>Report Parking Issue</Text>
          <Text style={rpb.secondary}>Notify the owner anonymously</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={V.g500} />
      </View>
    </TapTarget>
  );
}

const rpb = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', borderRadius: V.rButton, borderWidth: 1.5, borderColor: V.amberBorder, backgroundColor: V.amberBg, paddingVertical: V.s16, paddingHorizontal: V.s20, minHeight: 68, gap: V.s14 as any },
  iconWrap: { width: 44, height: 44, borderRadius: V.rButton - 2, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  textCol: { flex: 1 },
  primary: { fontSize: 15, fontWeight: '700', color: V.amber, letterSpacing: -0.2 },
  secondary: { fontSize: 12, color: V.textSecondary, marginTop: 3 },
});

// ─── Generic Outline Action ────────────────────────────────────────────────────

function OutlineAction({ icon, label, hint, color = V.blue, onPress }: {
  icon: string; label: string; hint?: string; color?: string; onPress?: () => void;
}) {
  return (
    <TapTarget onPress={onPress} accessibilityLabel={label} style={{ marginBottom: V.s12 }}>
      <View style={[oa.btn, { borderColor: color + '35', backgroundColor: color + '08' }]}>
        <Ionicons name={icon as any} size={20} color={color} style={{ marginRight: V.s12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[oa.label, { color }]}>{label}</Text>
          {hint && <Text style={oa.hint}>{hint}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={16} color={V.g500} />
      </View>
    </TapTarget>
  );
}

const oa = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', borderRadius: V.rButton, borderWidth: 1.5, paddingVertical: V.s16, paddingHorizontal: V.s20, minHeight: 56 },
  label: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  hint: { fontSize: 12, color: V.textSecondary, marginTop: 2 },
});

// ─── Trust Strip ───────────────────────────────────────────────────────────────

function TrustStrip({ anim }: { anim: any }) {
  return (
    <Animated.View style={[anim, ts.wrap]}>
      {[
        { icon: 'shield-checkmark-outline', text: 'Anonymised connection' },
        { icon: 'lock-closed-outline', text: 'No personal data exposed' },
        { icon: 'eye-off-outline', text: 'Scanner identity protected' },
      ].map((item, i) => (
        <View key={i} style={ts.item}>
          <Ionicons name={item.icon as any} size={14} color={V.green} />
          <Text style={ts.text}>{item.text}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const ts = StyleSheet.create({
  wrap: { backgroundColor: V.greenBg, borderRadius: V.rCard, borderWidth: 1, borderColor: V.greenBorder, padding: V.s16, gap: V.s10, marginTop: V.s8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: V.s10 },
  text: { fontSize: 13, color: V.green, fontWeight: '600' },
});

// ─── Critical Alert Bar ────────────────────────────────────────────────────────

function AlertBar({ message }: { message: string }) {
  return (
    <View style={ab.wrap} accessibilityRole="alert" accessibilityLabel={`Alert: ${message}`}>
      <Ionicons name="alert-circle" size={18} color={V.red} />
      <Text style={ab.text}>{message}</Text>
    </View>
  );
}

const ab = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: V.s10, backgroundColor: V.redBg, borderRadius: V.rTag, borderWidth: 1, borderColor: V.redBorder, padding: V.s14 as any, marginBottom: V.s16 },
  text: { flex: 1, fontSize: 14, fontWeight: '700', color: '#FCA5A5', lineHeight: 20 },
});

// ─── Empty / Error States ──────────────────────────────────────────────────────

function EmptyState({ reason }: { reason: string }) {
  return (
    <View style={es.wrap} accessibilityRole="text">
      <View style={es.iconBox}>
        <Ionicons name="alert-circle-outline" size={32} color={V.g400} />
      </View>
      <Text style={es.title}>No Tag Data</Text>
      <Text style={es.body}>{reason}</Text>
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: V.s32, gap: V.s12 },
  iconBox: { width: 64, height: 64, borderRadius: V.rCard, backgroundColor: V.surfaceCard, borderWidth: 1, borderColor: V.surfaceBorder, justifyContent: 'center', alignItems: 'center', marginBottom: V.s8 },
  title: { fontSize: 18, fontWeight: '800', color: V.textPrimary, letterSpacing: -0.3 },
  body: { fontSize: 14, color: V.textSecondary, textAlign: 'center', lineHeight: 21 },
});

// ─── Vehicle Icon Header ───────────────────────────────────────────────────────

function VehicleHeader({ vehicleType, plate: plateNumber, status, delay }: {
  vehicleType?: string; plate?: string; status: StatusType; delay: number;
}) {
  const anim = useFadeIn(delay);
  const vehicleIcon = vehicleType?.toLowerCase().includes('bike') ? 'bicycle'
    : vehicleType?.toLowerCase().includes('truck') ? 'bus'
      : 'car-sport';

  return (
    <Animated.View style={[anim, vh.wrap]}>
      {/* Vehicle type icon */}
      <View style={vh.iconRing}>
        <Ionicons name={vehicleIcon as any} size={40} color={V.blue} />
      </View>

      {/* Status */}
      <StatusBadge status={status} label={status === 'active' ? 'Active' : status === 'alert' ? 'Alert' : 'Inactive'} />

      {/* Plate */}
      {plateNumber && (
        <View style={{ marginTop: V.s20, marginBottom: V.s8 }}>
          <NumberPlate registration={plateNumber} />
        </View>
      )}

      {/* Vehicle type label */}
      {vehicleType && (
        <Text style={vh.typeLabel} accessibilityLabel={`Vehicle type: ${vehicleType}`}>
          {vehicleType}
        </Text>
      )}
    </Animated.View>
  );
}

const vh = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: V.s16, paddingBottom: V.s28, gap: V.s16 },
  iconRing: { width: 88, height: 88, borderRadius: 44, backgroundColor: V.blueBg, borderWidth: 1, borderColor: V.blueBorder, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: 14, fontWeight: '600', color: V.textSecondary, letterSpacing: 0.3 },
});

// ─── Main Component ────────────────────────────────────────────────────────────

export function CarScanView({ payload }: { payload: any }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (payload) {
      AccessibilityInfo.announceForAccessibility(
        `Vehicle tag for ${payload.registrationMasked || 'unknown registration'}. ${payload.vehicleType ? payload.vehicleType + '.' : ''} Use the actions below to contact the owner.`
      );
    }
  }, [payload]);

  if (!payload) {
    return (
      <LinearGradient colors={[V.g950, V.g900, V.g800]} style={{ flex: 1 }}>
        <EmptyState reason="This tag has no data attached or may have been deactivated. Contact support if this is unexpected." />
      </LinearGradient>
    );
  }

  // Resolve action types
  const hasCall = payload.actionsAvailable?.some((a: any) => a.actionType === 'MASKED_CALL_OWNER');
  const hasParking = payload.actionsAvailable?.some((a: any) => a.actionType === 'REPORT_PARKING_ISSUE');
  const hasWhatsapp = payload.actionsAvailable?.some((a: any) => a.actionType === 'WHATSAPP_OWNER');
  const hasSms = payload.actionsAvailable?.some((a: any) => a.actionType === 'SMS_OWNER');
  const hasAlert = !!payload.criticalAlert;

  const tagStatus: StatusType = hasAlert ? 'alert' : payload.isActive ? 'active' : 'inactive';

  // Staggered animation times
  const anim0 = useFadeIn(0);
  const anim1 = useFadeIn(80);
  const anim2 = useFadeIn(160);
  const anim3 = useFadeIn(240);
  const anim4 = useFadeIn(320);
  const trustAnim = useFadeIn(400);

  return (
    <LinearGradient colors={[V.g950, V.g900]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          cw.content,
          { paddingTop: insets.top + V.s12, paddingBottom: insets.bottom + V.s48 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Vehicle Header ── */}
        <VehicleHeader
          vehicleType={payload.vehicleType}
          plate={payload.registrationMasked || payload.registration}
          status={tagStatus}
          delay={0}
        />

        {/* ── Critical Alert ── */}
        {hasAlert && (
          <Animated.View style={anim0}>
            <AlertBar message={payload.criticalAlert} />
          </Animated.View>
        )}

        {/* ── Vehicle Details ── */}
        {(payload.make || payload.model || payload.color || payload.year || payload.fuelType) && (
          <Animated.View style={anim1}>
            <SectionBlock label="Vehicle Details">
              {payload.make && (
                <DataRow icon="car-outline" label="Make & Model" value={`${payload.make}${payload.model ? ' ' + payload.model : ''}`} />
              )}
              {payload.year && (
                <DataRow icon="calendar-outline" label="Year" value={payload.year} mono />
              )}
              {payload.color && (
                <DataRow icon="color-palette-outline" label="Colour" value={payload.color} />
              )}
              {payload.fuelType && (
                <DataRow icon="flash-outline" label="Fuel" value={payload.fuelType} isLast />
              )}
              {!payload.year && !payload.color && !payload.fuelType && (
                <DataRow icon="information-circle-outline" label="Type" value={payload.vehicleType || '—'} isLast />
              )}
            </SectionBlock>
          </Animated.View>
        )}

        {/* ── Owner / Tag Info ── */}
        {(payload.tagId || payload.registeredCity || payload.ownerNote) && (
          <Animated.View style={anim2}>
            <SectionBlock label="Tag Information">
              {payload.tagId && (
                <DataRow icon="barcode-outline" label="Tag ID" value={payload.tagId} mono />
              )}
              {payload.registeredCity && (
                <DataRow icon="location-outline" label="Registered City" value={payload.registeredCity} />
              )}
              {payload.ownerNote && (
                <DataRow icon="chatbubble-ellipses-outline" label="Owner Note" value={payload.ownerNote} isLast />
              )}
            </SectionBlock>
          </Animated.View>
        )}

        {/* ── Actions ── */}
        {payload.actionsAvailable?.length > 0 && (
          <Animated.View style={anim3}>
            <Text style={cw.sectionHeader}>CONTACT OPTIONS</Text>

            {hasCall && <CallOwnerButton onPress={() => { }} />}
            {hasParking && <ReportParkingButton onPress={() => { }} />}
            {hasWhatsapp && (
              <OutlineAction
                icon="logo-whatsapp"
                label="WhatsApp Owner"
                hint="Sends via WhatsApp anonymously"
                color="#25D366"
                onPress={() => { }}
              />
            )}
            {hasSms && (
              <OutlineAction
                icon="chatbubble-outline"
                label="Send SMS"
                hint="Message delivered anonymously"
                color={V.blueLight}
                onPress={() => { }}
              />
            )}
          </Animated.View>
        )}

        {/* ── Trust Strip ── */}
        {(hasCall || hasSms || hasWhatsapp) && (
          <TrustStrip anim={trustAnim} />
        )}

        {/* ── Footer ── */}
        <Animated.View style={[anim4, cw.footer]}>
          <View style={cw.footerInner}>
            <Ionicons name="shield-outline" size={13} color={V.textMuted} />
            <Text style={cw.footerText}>
              Powered by a secure vehicl tag. All contacts are anonymized.
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </LinearGradient>
  );
}

// ─── Screen Styles ─────────────────────────────────────────────────────────────

const cw = StyleSheet.create({
  content: { paddingHorizontal: V.s20 },
  sectionHeader: {
    fontSize: 10, fontWeight: '800', color: V.textMuted,
    letterSpacing: 1.6, textTransform: 'uppercase',
    marginBottom: V.s12, paddingHorizontal: 2,
  },
  footer: { marginTop: V.s24 },
  footerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: V.s6 },
  footerText: { fontSize: 12, color: V.textMuted, textAlign: 'center' },
});