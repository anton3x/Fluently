import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_KIND = "daily-practice";
const REMINDER_CHANNEL = "daily-reminders";

function isDailyReminder(request: Notifications.NotificationRequest) {
  return request.content.data?.kind === REMINDER_KIND;
}

export class DailyReminderService {
  async isEnabled() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    return scheduled.some(isDailyReminder);
  }

  async disable() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    await Promise.all(
      scheduled
        .filter(isDailyReminder)
        .map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier)
        )
    );
  }

  async ensurePermission() {
    const permissions = await Notifications.getPermissionsAsync();

    const granted =
      permissions.granted ||
      permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (granted) {
      return true;
    }

    const request = await Notifications.requestPermissionsAsync();

    return (
      request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }

  async enable(title: string, body: string, channelName: string) {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
        name: channelName,
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const granted = await this.ensurePermission();

    if (!granted) {
      return false;
    }

    await this.disable();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          kind: REMINDER_KIND,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
        channelId: Platform.OS === "android" ? REMINDER_CHANNEL : undefined,
      },
    });

    return true;
  }
}

export const dailyReminderService = new DailyReminderService();
