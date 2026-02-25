import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface Message {
    id: string;
    senderName: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

// ─── Design System (Synced with HomeScreen) ───────────────────────────────────

const RADII = { sm: 10, md: 14, lg: 20, xl: 24, full: 9999 };
const COLOR = {
    blue: '#3B82F6',
    blueFrost: 'rgba(59,130,246,0.12)',
    grey400: '#94A3B8',
    grey600: '#475569',
    grey900: '#0F172A',
    white: '#FFFFFF',
    bgDark: '#0B0F1A',
    surfaceDark: '#151E32',
    borderDark: 'rgba(255,255,255,0.08)',
};

export default function InboxScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { mode } = useThemeStore();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isDark = mode === 'dark';
    const theme = {
        bg: isDark ? COLOR.bgDark : '#F8FAFC',
        surface: isDark ? COLOR.surfaceDark : COLOR.white,
        text: isDark ? '#EEF2FF' : COLOR.grey900,
        textSub: isDark ? '#8B9FCC' : COLOR.grey600,
        border: isDark ? COLOR.borderDark : '#E2E8F0',
        primary: COLOR.blue,
    };

    const fetchMessages = useCallback(async () => {
        if (!user?.id && !user?._id) {
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }
        const ownerId = user.id || user._id;

        try {
            const response = await api.get(`/messages/${ownerId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchMessages();
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <TouchableOpacity
            style={[styles.messageCard, {
                backgroundColor: theme.surface,
                borderColor: theme.border
            }]}
            activeOpacity={0.7}
        >
            <View style={styles.messageHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item.senderName[0].toUpperCase()}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.senderName, { color: theme.text }]}>{item.senderName}</Text>
                    <Text style={[styles.timestamp, { color: theme.textSub }]}>
                        {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
            </View>
            <Text style={[styles.messageBody, { color: theme.textSub }]} numberOfLines={3}>
                {item.message}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            ) : messages.length > 0 ? (
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.primary}
                        />
                    }
                />
            ) : (
                <View style={styles.center}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '08' }]}>
                        <Ionicons name="mail-unread-outline" size={48} color={theme.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No messages yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textSub }]}>
                        When someone scans your tag and sends a message, it will appear here.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    list: {
        padding: 16,
    },
    messageCard: {
        borderRadius: RADII.lg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerInfo: {
        flex: 1,
    },
    senderName: {
        fontSize: 16,
        fontWeight: '700',
    },
    timestamp: {
        fontSize: 12,
        marginTop: 2,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    messageBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});
