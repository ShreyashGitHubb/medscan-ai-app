import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class NotificationService {
    constructor() {
        this.askPermissions();
    }

    async askPermissions() {
        if (Platform.OS === 'web') return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return false;
        }
        return true;
    }

    async scheduleReminder(title, body, seconds = 14400) { // Default 4 hours
        const hasPermission = await this.askPermissions();
        if (!hasPermission) return false;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: 'default',
            },
            trigger: {
                seconds: seconds,
                repeats: false, // For now, one-time reminder. Can be 'true' for recurring.
            },
        });
        return true;
    }
}

export default new NotificationService();
