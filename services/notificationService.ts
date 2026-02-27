import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';
import { ENDPOINTS } from './config';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    static async registerForPushNotificationsAsync(ownerId: string) {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: '3498ce26-8fb5-4c5d-96a9-4b723b3defe8'
            })).data;
            console.log('Expo Push Token:', token);

            // Register token with backend
            try {
                await api.post(ENDPOINTS.MESSAGE_REGISTER_TOKEN, { ownerId, pushToken: token });
                if (__DEV__) console.log('Token registered with backend');
            } catch (error: any) {
                // Silently fail - don't block app functionality
                if (__DEV__) {
                    console.warn('Failed to register push token:', error.response?.data || error.message);
                }
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    }
}
