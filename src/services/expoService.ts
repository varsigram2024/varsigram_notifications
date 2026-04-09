import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (expoPushToken: string, senderName: string, text: string) => {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(` Invalid Expo token: ${expoPushToken}`);
    return;
  }

  const messages = [{
    to: expoPushToken,
    sound: 'default' as const,
    title: `New message from ${senderName}`,
    body: text,
  }];

  try {
    await expo.sendPushNotificationsAsync(messages);
    console.log(`Push successfully sent to token: ${expoPushToken}`);
  } catch (error) {
    console.error(" Failed to send Expo push:", error);
  }
};