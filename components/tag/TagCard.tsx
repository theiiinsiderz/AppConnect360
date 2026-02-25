/**
 * TagCard — v4
 *
 * Uses TagCardShared v4 components.
 * Key wire-up change: PrimaryCommButton now requires `iconGlowColor`.
 * Passed from COMM tokens per button type.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import { Tag } from '../../store/tagStore';
import { useAppTheme } from '../../theme/theme';
import {
  COMM,
  MOTION,
  PrimaryCommButton,
  R,
  SmsToggleRow,
  TagCardHeader,
  TagCardIdentifier,
  TagCardMeta,
  getTypeConfig,
  sharedS,
  sp,
  type TagDomain
} from './TagCardShared';

// ─── Tag Card ─────────────────────────────────────────────────────────────────

export interface TagCardProps {
  tag: Tag;
  onTogglePrivacy: (tagId: string, setting: keyof Tag['privacy']) => void;
  onPress: () => void;
}

export const TagCard: React.FC<TagCardProps> = memo(({ tag, onTogglePrivacy, onPress }) => {
  const theme = useAppTheme();

  const rawDomain = (tag.domainType ?? 'CAR') as string;
  const domain: TagDomain = (['CAR', 'KID', 'PET'] as const).includes(rawDomain as TagDomain)
    ? (rawDomain as TagDomain)
    : 'CAR';

  const cfg = getTypeConfig(domain, theme.isDark);
  const scanCount = tag.scans?.length ?? 0;

  const cardScale = useRef(new Animated.Value(1)).current;

  const handleCardPress = useCallback(() => {
    Animated.sequence([
      Animated.spring(cardScale, {
        toValue: MOTION.cardScale,
        useNativeDriver: true,
        speed: MOTION.cardPress.speed,
        bounciness: MOTION.cardPress.bounciness,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: MOTION.cardPress.bounceBack.speed,
        bounciness: MOTION.cardPress.bounceBack.bounciness,
      }),
    ]).start();
    onPress();
  }, [onPress]);

  const toggleCall = useCallback(() => onTogglePrivacy(tag._id, 'allowMaskedCall'), [tag._id, onTogglePrivacy]);
  const toggleWA = useCallback(() => onTogglePrivacy(tag._id, 'allowWhatsapp'), [tag._id, onTogglePrivacy]);
  const toggleSms = useCallback(() => onTogglePrivacy(tag._id, 'allowSms'), [tag._id, onTogglePrivacy]);

  const privacy = tag.privacy || {
    allowMaskedCall: false,
    allowWhatsapp: false,
    allowSms: false,
    showEmergencyContact: false,
  };

  const cardRadius = cfg.cardRadius;
  const btnRadius = cfg.btnRadius;
  const smsRadius = domain === 'CAR' ? R.md : R.lg;
  const framePadding = domain === 'KID' ? sp(2.5) : sp(2);
  const frameGap = domain === 'KID' ? sp(2) : sp(1.75);

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`${tag.nickname}, ${cfg.typeLabel.toLowerCase()} tag, ${tag.isActive ? 'active' : 'disabled'}`}
      accessibilityHint="Tap to view tag details"
    >
      <Animated.View style={[cardS.root, { borderRadius: cardRadius, transform: [{ scale: cardScale }] }]}>

        {/* Card background gradient */}
        <LinearGradient
          colors={cfg.cardGrad as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]}
        />

        {/* Background Pattern */}
        {domain === 'CAR' ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[cardS.slash, { top: -20, right: 40, width: 120, opacity: 0.25, backgroundColor: cfg.accent }]} />
            <View style={[cardS.slash, { top: 40, right: -10, width: 160, opacity: 0.15, backgroundColor: cfg.accent }]} />
            <View style={[cardS.slash, { bottom: 100, left: -20, width: 200, opacity: 0.12, backgroundColor: cfg.accent }]} />
            <View style={[cardS.slash, { bottom: 140, left: 20, width: 80, opacity: 0.18, backgroundColor: cfg.accent }]} />
          </View>
        ) : (
          <>
            <View style={[cardS.orb, cfg.orb1Style, { backgroundColor: cfg.accentFrost }]} />
            <View style={[cardS.orb, cfg.orb2Style, { backgroundColor: cfg.accentFrost }]} />
          </>
        )}

        {/* Card frame */}
        <View style={[
          cardS.frame,
          {
            borderColor: cfg.borderColor,
            borderRadius: cardRadius - 2,
            padding: framePadding,
            gap: frameGap,
          },
        ]}>

          <TagCardHeader tag={tag} config={cfg} />

          <TagCardIdentifier tag={tag} config={cfg} />
          <TagCardMeta scanCount={scanCount} config={cfg} />

          <View style={[sharedS.divider, { backgroundColor: cfg.borderColor }]} />

          {/* ── Communication Tier 1: Call + WhatsApp ── */}
          <View style={sharedS.primaryRow}>
            <PrimaryCommButton
              icon="call"
              label={cfg.callLabel}
              sublabel={cfg.callSublabel}
              gradientColors={COMM.callGrad}
              glowColor={COMM.callGlow}
              iconGlowColor={COMM.callIconGlow}
              active={privacy.allowMaskedCall}
              onToggle={toggleCall}
              borderColor={cfg.borderColor}
              accentFrost={cfg.accentFrost}
              accentMuted={cfg.accentMuted}
              borderRadius={btnRadius}
            />
            <PrimaryCommButton
              icon="logo-whatsapp"
              label={cfg.waLabel}
              sublabel={cfg.waSublabel}
              gradientColors={COMM.waGrad}
              glowColor={COMM.waGlow}
              iconGlowColor={COMM.waIconGlow}
              active={privacy.allowWhatsapp}
              onToggle={toggleWA}
              borderColor={cfg.borderColor}
              accentFrost={cfg.accentFrost}
              accentMuted={cfg.accentMuted}
              borderRadius={btnRadius}
            />
          </View>

          {/* ── Communication Tier 2: SMS ── */}
          <SmsToggleRow
            active={privacy.allowSms}
            onToggle={toggleSms}
            borderColor={cfg.borderColor}
            accentFrost={cfg.accentFrost}
            accentMuted={cfg.accentMuted}
            isDark={theme.isDark}
            borderRadius={smsRadius}
          />

        </View>
      </Animated.View>
    </Pressable>
  );
});

const cardS = StyleSheet.create({
  root: {
    height: 440,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  orb: { position: 'absolute' },
  slash: {
    position: 'absolute',
    height: 1,
    transform: [{ rotate: '-35deg' }],
  },
  frame: { flex: 1, justifyContent: 'space-between', borderWidth: StyleSheet.hairlineWidth },
});
