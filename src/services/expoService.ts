import { Expo } from 'expo-server-sdk';
import { ConversationType } from '../types';

const expo = new Expo();

interface ChatPushData {
  [key: string]: unknown;
  type: 'message';
  conversation_id: string;
  conversation_type: ConversationType;
  sender_id?: string;
}

export const sendPushNotification = async (
  expoPushToken: string,
  senderName: string,
  text: string,
  data: ChatPushData
) => {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(` Invalid Expo token: ${expoPushToken}`);
    return;
  }

  const messages = [{
    to: expoPushToken,
    sound: 'default' as const,
    title: `New message from ${senderName}`,
    body: text,
    data,
  }];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log(`Push successfully sent to token: ${expoPushToken}`);
  } catch (error) {
    console.error(" Failed to send Expo push:", error);
  }
};