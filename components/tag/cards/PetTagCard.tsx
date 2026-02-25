import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Tag } from '../../../store/tagStore';
import { useAppTheme } from '../../../theme/theme';
import { AnimatedPetBackground, COMM, getTypeConfig, MOTION, PrimaryCommButton, R, sharedS, SmsToggleRow, sp, TagCardHeader, TagCardIdentifier, TagCardMeta } from '../TagCardShared';


export interface TagCardProps {
    tag: Tag;
    onTogglePrivacy: (tagId: string, setting: keyof Tag['privacy']) => void;
    onPress: () => void;
}

export const PetTagCard: React.FC<TagCardProps> = memo(({ tag, onTogglePrivacy, onPress }) => {
    const theme = useAppTheme();

    // Hardcoded for Pet customization
    const domain = 'PET';
    const cfg = getTypeConfig(domain, theme.isDark);
    const scanCount = tag.scans?.length ?? 0;

    const cardScale = useRef(new Animated.Value(1)).current;

    const handleCardPress = useCallback(() => {
        Animated.sequence([
            Animated.spring(cardScale, { toValue: MOTION.cardScale, useNativeDriver: true, speed: MOTION.cardPress.speed, bounciness: MOTION.cardPress.bounciness }),
            Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: MOTION.cardPress.bounceBack.speed, bounciness: MOTION.cardPress.bounceBack.bounciness }),
        ]).start();
        onPress();
    }, [onPress]);

    const tagId = tag._id || tag.id || tag.code;

    const toggleCall = useCallback(() => onTogglePrivacy(tagId, 'allowMaskedCall'), [tagId, onTogglePrivacy]);
    const toggleWA = useCallback(() => onTogglePrivacy(tagId, 'allowWhatsapp'), [tagId, onTogglePrivacy]);
    const toggleSms = useCallback(() => onTogglePrivacy(tagId, 'allowSms'), [tagId, onTogglePrivacy]);

    const privacy = tag.privacy || {
        allowMaskedCall: false,
        allowWhatsapp: false,
        allowSms: false,
        showEmergencyContact: false,
    };

    const btnRadius = R.xl;
    const smsRadius = R.lg;
    const cardRadius = cfg.cardRadius;
    const framePadding = sp(2.5);
    const frameGap = sp(2);

    return (
        <Pressable
            onPress={handleCardPress}
            accessibilityRole="button"
            accessibilityLabel={`${tag.nickname}, ${cfg.typeLabel.toLowerCase()} tag, ${tag.isActive ? 'active' : 'disabled'}`}
            accessibilityHint="Tap to view tag details"
        >
            <Animated.View style={[
                cardS.root,
                { borderRadius: cardRadius, transform: [{ scale: cardScale }] },
            ]}>

                <LinearGradient
                    colors={cfg.cardGrad as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]}
                />

                {cfg.paws && <AnimatedPetBackground color={cfg.accent} />}


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

                    <View style={[cardS.divider, { backgroundColor: cfg.borderColor }]} />

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
        height: 420,

        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    orb: { position: 'absolute' },
    frame: {
        flex: 1,
        justifyContent: 'space-between',
        borderWidth: StyleSheet.hairlineWidth,
    },
    divider: { height: StyleSheet.hairlineWidth },
});