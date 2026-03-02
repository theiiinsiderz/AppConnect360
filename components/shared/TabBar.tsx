/**
 * TabBar — Polished Production Redesign
 *
 * Fixes:
 * - Eliminated redundant paddingTop/paddingBottom that doubled safe-area padding
 * - Replaced `insets.bottom - 4` arithmetic with intentional, explicit layout logic
 * - BAR_HEIGHT defines the visible icon row; insets.bottom fills below it cleanly
 * - Scan button lift is clipped properly with overflow:visible propagated correctly
 * - Android: elevation shadow only, no iOS shadows leaking through
 * - Consistent visual weight across all screen sizes
 */

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/theme';

type Route = {
    key: string;
    name: string;
    params?: object;
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ICON_SIZE = 22;
const SCAN_BUTTON_SIZE = 52;
const BAR_HEIGHT = 56; // Fixed visible content height — tight and intentional
const ACTIVE_COLOR = '#3B82F6';
const INACTIVE_COLOR_DARK = '#6B7280';
const INACTIVE_COLOR_LIGHT = '#94A3B8';

const ICON_MAP: Record<string, { active: string; inactive: string; label: string }> = {
    index: { active: 'home', inactive: 'home-outline', label: 'Home' },
    tags: { active: 'pricetags', inactive: 'pricetags-outline', label: 'Tags' },
    scan: { active: 'scan', inactive: 'scan-outline', label: 'Scan' },
    shop: { active: 'cart', inactive: 'cart-outline', label: 'Shop' },
    profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

// ─── Tab Item ────────────────────────────────────────────────────────────────

const TabItem = memo(({
    route,
    isFocused,
    onPress,
    onLongPress,
    options,
}: {
    route: Route;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    options: any;
}) => {
    const t = useAppTheme();
    const icons = ICON_MAP[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline', label: route.name };
    const iconName = isFocused ? icons.active : icons.inactive;
    const color = isFocused
        ? ACTIVE_COLOR
        : t.isDark ? INACTIVE_COLOR_DARK : INACTIVE_COLOR_LIGHT;

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isFocused ? 1.08 : 1, { damping: 18, stiffness: 200 }) },
        ],
        opacity: withSpring(isFocused ? 1 : 0.75, { damping: 18, stiffness: 200 }),
    }));

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            hitSlop={8}
            android_ripple={{ color: 'rgba(59,130,246,0.10)', borderless: true, radius: 32 }}
        >
            <Animated.View style={[styles.tabIconWrap, animStyle]}>
                <Ionicons name={iconName as any} size={ICON_SIZE} color={color} />
                <Text style={[styles.tabLabel, { color }]}>{icons.label}</Text>
            </Animated.View>
        </Pressable>
    );
});

// ─── Scan Button ─────────────────────────────────────────────────────────────

const ScanButton = memo(({
    isFocused,
    onPress,
    onLongPress,
}: {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) => {
    const t = useAppTheme();

    const ringBg = t.isDark
        ? 'rgba(10,14,26,1)'
        : 'rgba(248,250,252,1)';

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.scanBtnOuter}
            accessibilityRole="button"
            accessibilityLabel="Scan a tag"
            hitSlop={8}
            android_ripple={{ color: 'rgba(59,130,246,0.2)', borderless: true, radius: 36 }}
        >
            {/* Ring acts as a visual separator between bar and raised button */}
            <View style={[styles.scanBtnRing, { backgroundColor: ringBg }]}>
                <LinearGradient
                    colors={isFocused ? ['#1D4ED8', '#3B82F6'] : ['#3B82F6', '#60A5FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scanBtnGradient}
                >
                    <Ionicons name="scan" size={24} color="#FFFFFF" />
                </LinearGradient>
            </View>
        </Pressable>
    );
});

// ─── Main TabBar ──────────────────────────────────────────────────────────────

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const t = useAppTheme();
    const insets = useSafeAreaInsets();

    // Hide on scan screen
    const currentRoute = state.routes[state.index];
    if (currentRoute.name === 'scan') return null;

    const barBgColor = t.isDark
        ? 'rgba(10,14,26,0.96)'
        : 'rgba(255,255,255,0.97)';

    const borderColor = t.isDark
        ? 'rgba(255,255,255,0.07)'
        : 'rgba(0,0,0,0.07)';

    return (
        <View
            pointerEvents="box-none"
            style={styles.container}
        >
            {/*
             * Two-layer layout:
             *   1. barRow    — fixed BAR_HEIGHT, holds icons & scan button
             *   2. safeFloor — fills exactly insets.bottom, no extra padding
             * This prevents double-stacking insets and keeps the bar visually tight.
             */}
            <View style={[styles.barRow, {
                backgroundColor: barBgColor,
                borderTopColor: borderColor,
                height: BAR_HEIGHT,
            }]}>
                {state.routes.map((route: Route, index: number) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const isScan = route.name === 'scan';

                    if (
                        (options as any).href === null ||
                        route.name === 'inbox' ||
                        (!ICON_MAP[route.name] && !isScan)
                    ) return null;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    if (isScan) {
                        return (
                            <ScanButton
                                key={route.key}
                                isFocused={isFocused}
                                onPress={onPress}
                                onLongPress={onLongPress}
                            />
                        );
                    }

                    return (
                        <TabItem
                            key={route.key}
                            route={route}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            options={options}
                        />
                    );
                })}
            </View>

            {/* Safe area floor: fills system nav bar area with matching background, no padding tricks */}
            {insets.bottom > 0 && (
                <View style={[
                    styles.safeFloor,
                    {
                        height: insets.bottom,
                        backgroundColor: barBgColor,
                    },
                ]} />
            )}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        // Allow scan button to float above the bar
        overflow: 'visible',
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: StyleSheet.hairlineWidth,
        overflow: 'visible',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    // Seamlessly extends the bar color under the system gesture nav bar
    safeFloor: {
        width: '100%',
    },
    tabItem: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 0.1,
        lineHeight: 12,
    },
    // Raised scan button: lifted above the bar by half its own height
    scanBtnOuter: {
        width: SCAN_BUTTON_SIZE + 16,
        alignItems: 'center',
        justifyContent: 'flex-end',
        // Raise the button so its center sits at the bar's top edge
        marginBottom: (SCAN_BUTTON_SIZE + 16) / 2 - BAR_HEIGHT / 2,
    },
    scanBtnRing: {
        width: SCAN_BUTTON_SIZE + 8,
        height: SCAN_BUTTON_SIZE + 8,
        borderRadius: (SCAN_BUTTON_SIZE + 8) / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanBtnGradient: {
        width: SCAN_BUTTON_SIZE,
        height: SCAN_BUTTON_SIZE,
        borderRadius: SCAN_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});