import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { radii, spacing, typography, useAppTheme } from '../../theme/theme';

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
        points: ['By using Connect360, you consent to this Privacy Policy and agree to its terms.'],
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
        points: ['If you have privacy questions or requests, contact Connect360 support through the app support channel.'],
    },
];

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const t = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: t.bg }]}>
            <StatusBar
                barStyle={t.isDark ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />
            <ScreenHeader title="Privacy Policy" showBack onBack={() => router.back()} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.metaCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                    <Text style={[styles.metaTitle, { color: t.text }]}>Connect360 Privacy Policy</Text>
                    <Text style={[styles.metaText, { color: t.textSecondary }]}>Effective Date: March 2, 2026</Text>
                </View>

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
});
