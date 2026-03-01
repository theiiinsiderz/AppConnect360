import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuthStore } from '../../store/authStore';
import { radii, spacing, typography, useAppTheme } from '../../theme/theme';

type ConsentChoice = 'yes' | 'no' | null;

interface PolicySection {
    title: string;
    points: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
    {
        title: 'Who This Policy Applies To',
        points: [
            'This Privacy Policy applies to online activity in Connect360 and explains how information is collected, used, and protected.',
            'It does not apply to information collected offline or through channels outside Connect360.',
        ],
    },
    {
        title: 'Consent',
        points: [
            'By using Connect360, you consent to this Privacy Policy and agree to its terms.',
        ],
    },
    {
        title: 'Information We Collect',
        points: [
            'We collect only the information needed to deliver and improve our services.',
            'When you contact us, we may collect your name, phone number, email, message content, and attachments.',
            'When you create or use an account, we may collect contact details such as name, phone number, email, and address information.',
        ],
    },
    {
        title: 'How We Use Information',
        points: [
            'Provide, operate, maintain, and improve Connect360.',
            'Personalize your experience and develop new features.',
            'Communicate service updates, support responses, and security notifications.',
            'Send relevant email or app communications when applicable.',
            'Detect and prevent fraud, misuse, and unauthorized activity.',
        ],
    },
    {
        title: 'Log Files, Cookies, and Analytics',
        points: [
            'Like most services, we collect technical logs (IP, browser, ISP, timestamp, referring/exit pages, and click data) for analytics and security.',
            'Connect360 may use cookies or similar technologies to remember user preferences and improve performance.',
            'You can control cookies in your browser or device settings.',
        ],
    },
    {
        title: 'Advertising and Third Parties',
        points: [
            'Connect360 does not run third-party advertisements and does not allow ad placements inside the platform.',
            'If you use external websites or services linked from Connect360, their privacy policies apply to their own data practices.',
        ],
    },
    {
        title: 'Data Security and Hosting',
        points: [
            'We use industry-standard security controls and encryption safeguards for data protection.',
            'Data is hosted on AWS infrastructure in Mumbai, India.',
            'We collect and retain only data necessary for service operation, support, compliance, and fraud prevention.',
        ],
    },
    {
        title: 'Your Rights (CCPA / GDPR)',
        points: [
            'Depending on your location, you may request access, correction, deletion, restriction, objection, and data portability for your personal data.',
            'You may also request disclosure of categories and specific personal data collected about you.',
            'If you submit a valid privacy request, we aim to respond within one month.',
        ],
    },
    {
        title: "Children's Privacy",
        points: [
            'Connect360 does not knowingly collect personal information from children under 13.',
            'If you believe a child has submitted personal information, contact us and we will take prompt removal steps where appropriate.',
        ],
    },
    {
        title: 'Contact',
        points: [
            'If you have privacy questions or requests, contact Connect360 support through the app support channel.',
        ],
    },
];

const readParam = (value?: string | string[]) => {
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
};

type PrivacyMode = 'accept' | 'view';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const t = useAppTheme();
    const { phone, source, mode } = useLocalSearchParams<{
        phone?: string | string[];
        source?: string | string[];
        mode?: string | string[];
    }>();
    const { authenticate, hasAcceptedPrivacyPolicy, setPrivacyConsent, user } = useAuthStore();

    const sourceRoute = useMemo(() => readParam(source), [source]);
    const modeParam = useMemo(() => readParam(mode) as PrivacyMode || (sourceRoute === 'profile' ? 'view' : 'accept'), [mode, sourceRoute]);
    const normalizedPhone = useMemo(() => readParam(phone).replace(/\D/g, '').slice(-10), [phone]);
    const [consent, setConsent] = useState<ConsentChoice>(modeParam === 'view' ? 'yes' : (hasAcceptedPrivacyPolicy ? 'yes' : null));
    const [sendingOtp, setSendingOtp] = useState(false);

    const handleSelect = (choice: ConsentChoice) => {
        setConsent(choice);
        setPrivacyConsent(choice === 'yes');
    };

    const handleDecline = () => {
        handleSelect('no');
        Alert.alert(
            'Registration stopped',
            'You must agree to the Privacy Policy to continue with registration.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        if (modeParam === 'view' || sourceRoute === 'profile') {
                            router.back();
                            return;
                        }
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleContinueToOtp = async () => {
        if (consent !== 'yes') {
            Alert.alert('Consent required', 'Please select "Yes" to continue.');
            return;
        }

        if (!normalizedPhone) {
            Alert.alert('Phone number required', 'Please go back and enter a valid phone number first.');
            return;
        }

        setSendingOtp(true);
        const sent = await authenticate(normalizedPhone);
        setSendingOtp(false);

        if (!sent) {
            Alert.alert('Authentication failed', 'Please check your network and try again.');
            return;
        }

        router.replace('/(tabs)' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: t.bg }]}>
            <StatusBar
                barStyle={t.isDark ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />
            <ScreenHeader title="Privacy Policy" showBack onBack={() => router.back()} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={[styles.metaCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                    <Text style={[styles.metaTitle, { color: t.text }]}>Connect360 Privacy Policy</Text>
                    <Text style={[styles.metaText, { color: t.textSecondary }]}>
                        Effective Date: March 2, 2026
                    </Text>
                    {/* Show acceptance status in view mode */}
                    {modeParam === 'view' && (
                        <View style={[styles.acceptanceStatus, { backgroundColor: t.successMuted, borderColor: t.success }]}>
                            <Ionicons name="checkmark-circle" size={20} color={t.success} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.acceptanceLabel, { color: t.success }]}>
                                    ✓ You accepted this policy
                                </Text>
                                <Text style={[styles.acceptanceDate, { color: t.textSecondary }]}>
                                    During registration on Jan 20, 2026
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Policy Sections */}
                {POLICY_SECTIONS.map((section) => (
                    <View
                        key={section.title}
                        style={[styles.sectionCard, { backgroundColor: t.surface, borderColor: t.border }]}
                    >
                        <Text style={[styles.sectionTitle, { color: t.text }]}>{section.title}</Text>
                        {section.points.map((point) => (
                            <View key={point} style={styles.pointRow}>
                                <Text style={[styles.bullet, { color: t.primary }]}>-</Text>
                                <Text style={[styles.sectionPoint, { color: t.textSecondary }]}>{point}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Consent Section - Only in 'accept' mode */}
                {modeParam === 'accept' && (
                    <View style={[styles.consentCard, { backgroundColor: t.surface, borderColor: t.borderStrong }]}>
                        <Text style={[styles.consentTitle, { color: t.text }]}>
                            Do you agree with our Privacy Policy?
                        </Text>

                        <Pressable
                            onPress={() => handleSelect('yes')}
                            style={[
                                styles.choiceRow,
                                {
                                    borderColor: consent === 'yes' ? t.primary : t.border,
                                    backgroundColor: consent === 'yes' ? t.primaryMuted : t.surfaceMuted,
                                },
                            ]}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: consent === 'yes' }}
                            accessibilityLabel="Agree with privacy policy"
                        >
                            <Ionicons
                                name={consent === 'yes' ? 'checkbox' : 'square-outline'}
                                size={22}
                                color={consent === 'yes' ? t.primary : t.textSecondary}
                            />
                            <Text style={[styles.choiceText, { color: t.text }]}>Yes, I Agree</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleSelect('no')}
                            style={[
                                styles.choiceRow,
                                {
                                    borderColor: consent === 'no' ? t.danger : t.border,
                                    backgroundColor: consent === 'no' ? t.dangerMuted : t.surfaceMuted,
                                },
                            ]}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: consent === 'no' }}
                            accessibilityLabel="Do not agree with privacy policy"
                        >
                            <Ionicons
                                name={consent === 'no' ? 'checkbox' : 'square-outline'}
                                size={22}
                                color={consent === 'no' ? t.danger : t.textSecondary}
                            />
                            <Text style={[styles.choiceText, { color: t.text }]}>No, I Do Not Agree</Text>
                        </Pressable>

                        <Text style={[styles.helperText, { color: t.textSecondary }]}>
                            If you select No, registration will not continue.
                        </Text>

                        <Pressable
                            onPress={handleContinueToOtp}
                            disabled={sendingOtp || consent !== 'yes'}
                            style={[
                                styles.primaryButton,
                                {
                                    backgroundColor:
                                        sendingOtp || consent !== 'yes' ? t.primary + '80' : t.primary,
                                },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Accept and continue to OTP"
                        >
                            <Text style={styles.primaryButtonText}>
                                {sendingOtp ? 'Sending OTP...' : 'Accept & Continue'}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleDecline}
                            style={[styles.secondaryButton, { borderColor: t.borderStrong }]}
                            accessibilityRole="button"
                            accessibilityLabel="Decline privacy policy"
                        >
                            <Text style={[styles.secondaryButtonText, { color: t.textSecondary }]}>Decline</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
        gap: spacing.md,
    },
    metaCard: {
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: spacing.md,
    },
    metaTitle: {
        ...typography.heading,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    metaText: {
        ...typography.caption,
        fontWeight: '500',
    },
    acceptanceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.sm,
        marginTop: spacing.md,
    },
    acceptanceLabel: {
        ...typography.body,
        fontWeight: '600',
    },
    acceptanceDate: {
        ...typography.caption,
        marginTop: spacing.xs / 2,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.xs,
    },
    sectionTitle: {
        ...typography.body,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    bullet: {
        fontSize: 18,
        lineHeight: 20,
    },
    sectionPoint: {
        ...typography.caption,
        flex: 1,
    },
    consentCard: {
        borderWidth: 1.4,
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.sm,
    },
    consentTitle: {
        ...typography.body,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    choiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderRadius: radii.md,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.sm + 2,
    },
    choiceText: {
        ...typography.body,
        fontWeight: '600',
    },
    helperText: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    primaryButton: {
        marginTop: spacing.sm,
        borderRadius: radii.md,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        ...typography.body,
        fontWeight: '700',
    },
    secondaryButton: {
        borderWidth: 1,
        borderRadius: radii.md,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        ...typography.body,
        fontWeight: '600',
    },
});
