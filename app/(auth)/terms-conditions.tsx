import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { radii, spacing, typography, useAppTheme } from '../../theme/theme';

interface TermsSection {
    title: string;
    points: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
    {
        title: 'Acceptance of Terms',
        points: [
            'By accessing and using Connect360, you accept and agree to be bound by these Terms & Conditions.',
            'If you do not agree to these terms, please discontinue use of the service immediately.',
        ],
    },
    {
        title: 'Service Description',
        points: [
            'Connect360 is a privacy-focused vehicle tagging and communication system.',
            'The service allows users to register vehicle tags, manage privacy settings, and enable contact without revealing personal phone numbers.',
            'Features include NFC/manual tag registration, masked calling, WhatsApp integration, and public scanning capabilities.',
        ],
    },
    {
        title: 'User Accounts',
        points: [
            'You must provide accurate and complete information during registration.',
            'You are responsible for maintaining the confidentiality of your account credentials.',
            'You agree to notify us immediately of any unauthorized access to your account.',
            'One account per user; multiple accounts may be suspended or terminated.',
        ],
    },
    {
        title: 'Tag Registration and Usage',
        points: [
            'Tags must be registered to valid vehicle information.',
            'You are responsible for the accuracy of information associated with your tags.',
            'Tags must not be used for fraudulent, illegal, or malicious purposes.',
            'Connect360 reserves the right to deactivate tags that violate these terms.',
        ],
    },
    {
        title: 'Privacy and Communication',
        points: [
            'Users can enable masked calling and WhatsApp features to protect their privacy.',
            'When someone scans your tag, communication is facilitated without revealing your actual phone number.',
            'You agree not to misuse the communication features for spam, harassment, or illegal activities.',
        ],
    },
    {
        title: 'Prohibited Activities',
        points: [
            'Using the service for any unlawful purpose or in violation of any regulations.',
            'Attempting to gain unauthorized access to any part of the service or other user accounts.',
            'Transmitting viruses, malware, or any harmful code.',
            'Harassing, threatening, or impersonating other users.',
            'Scraping, data mining, or automated collection of user information.',
        ],
    },
    {
        title: 'Purchases and Payments',
        points: [
            'Tags and stickers can be purchased through the in-app shop.',
            'All purchases are subject to availability and pricing at the time of order.',
            'Payment processing is handled securely through third-party payment providers.',
            'Refunds are subject to our refund policy and applicable laws.',
        ],
    },
    {
        title: 'Intellectual Property',
        points: [
            'All content, trademarks, logos, and intellectual property in Connect360 are owned by or licensed to us.',
            'You may not copy, modify, distribute, or create derivative works without explicit permission.',
            'User-generated content remains your property, but you grant us a license to use it for service operation.',
        ],
    },
    {
        title: 'Limitation of Liability',
        points: [
            'Connect360 is provided "as is" without warranties of any kind, express or implied.',
            'We are not liable for any indirect, incidental, special, or consequential damages.',
            'We do not guarantee uninterrupted or error-free service.',
            'Our total liability shall not exceed the amount you paid for the service in the past 12 months.',
        ],
    },
    {
        title: 'Termination',
        points: [
            'We reserve the right to suspend or terminate your account for violations of these terms.',
            'You may terminate your account at any time through the app settings.',
            'Upon termination, your right to use the service ceases immediately.',
            'Certain provisions of these terms survive termination.',
        ],
    },
    {
        title: 'Changes to Terms',
        points: [
            'We may update these Terms & Conditions from time to time.',
            'Continued use of the service after changes constitutes acceptance of the new terms.',
            'Material changes will be notified through the app or via email.',
        ],
    },
    {
        title: 'Governing Law',
        points: [
            'These terms are governed by the laws of India.',
            'Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, India.',
        ],
    },
    {
        title: 'Contact Us',
        points: [
            'For questions about these Terms & Conditions, contact Connect360 support through the app support channel.',
        ],
    },
];

export default function TermsConditionsScreen() {
    const router = useRouter();
    const t = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: t.bg }]}>
            <StatusBar
                barStyle={t.isDark ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />
            <ScreenHeader title="Terms & Conditions" showBack onBack={() => router.back()} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.metaCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                    <Text style={[styles.metaTitle, { color: t.text }]}>Connect360 Terms & Conditions</Text>
                    <Text style={[styles.metaText, { color: t.textSecondary }]}>Effective Date: March 2, 2026</Text>
                    <Text style={[styles.metaText, { color: t.textSecondary, marginTop: spacing.xs }]}>
                        Last Updated: March 2, 2026
                    </Text>
                </View>

                {TERMS_SECTIONS.map((section) => (
                    <View
                        key={section.title}
                        style={[styles.sectionCard, { backgroundColor: t.surface, borderColor: t.border }]}
                    >
                        <Text style={[styles.sectionTitle, { color: t.text }]}>{section.title}</Text>
                        {section.points.map((point) => (
                            <View key={point} style={styles.pointRow}>
                                <Text style={[styles.bullet, { color: t.primary }]}>•</Text>
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
