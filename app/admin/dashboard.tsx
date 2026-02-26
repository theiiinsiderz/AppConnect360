import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { API_BASE_URL, ENDPOINTS } from '../../services/config';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';

    for (let i = 0; i < bytes.length; i += 3) {
        const b1 = bytes[i];
        const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

        result += chars[(b1 >> 2) & 0x3f];
        result += chars[((b1 << 4) | (b2 >> 4)) & 0x3f];
        result += i + 1 < bytes.length ? chars[((b2 << 2) | (b3 >> 6)) & 0x3f] : '=';
        result += i + 2 < bytes.length ? chars[b3 & 0x3f] : '=';
    }

    return result;
};

export default function AdminDashboard() {
    const router = useRouter();
    const { mode } = useThemeStore();
    const theme = colors[mode === 'dark' ? 'dark' : 'light'];
    const { user, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState('100');

    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

    if (!user || !isAdmin) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="lock-closed" size={64} color={theme.textMuted} />
                <Text style={{ color: theme.text, marginTop: 16 }}>Access Restricted</Text>
                <Button title="Go Home" onPress={() => router.replace('/')} style={{ marginTop: 20 }} />
            </View>
        );
    }

    const handleGenerateBatch = async () => {
        const parsedQuantity = Number.parseInt(quantity, 10);

        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
            Alert.alert('Invalid quantity', 'Please enter a positive number.');
            return;
        }

        if (!token) {
            Alert.alert('Unauthorized', 'Missing admin token. Please log in again.');
            return;
        }

        setLoading(true);
        try {
            const apiUrl = `${API_BASE_URL}${ENDPOINTS.ADMIN_GENERATE}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/pdf',
                },
                body: JSON.stringify({ quantity: parsedQuantity }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Generation failed');
            }

            if (Platform.OS === 'web') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'generated_tags.pdf';
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                window.URL.revokeObjectURL(url);
                Alert.alert('Success', 'PDF downloaded');
            } else {
                const fileUri = `${FileSystem.documentDirectory || ''}generated_tags.pdf`;
                const pdfBuffer = await response.arrayBuffer();
                const base64 = arrayBufferToBase64(pdfBuffer);

                await FileSystem.writeAsStringAsync(fileUri, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Alert.alert('Saved', `File saved to ${fileUri}`);
                }
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error?.message || 'Failed to generate batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header title="Admin Dashboard" showBack />

            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Ionicons name="documents-outline" size={48} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Batch Generation</Text>
                    <Text style={[styles.cardDesc, { color: theme.textMuted }]}>Generate QR codes and download the PDF for printing.</Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text }]}>Quantity:</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            keyboardType="number-pad"
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="Enter quantity (e.g., 100)"
                            placeholderTextColor={theme.textMuted}
                        />
                    </View>

                    <Button
                        title={`Generate ${quantity || 0} Tags & PDF`}
                        onPress={handleGenerateBatch}
                        loading={loading}
                        style={{ marginTop: 16, width: '100%' }}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    card: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
    },
    cardDesc: {
        textAlign: 'center',
        marginBottom: 8,
    },
    inputContainer: {
        width: '100%',
        marginVertical: 12,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});
