import * as admin from 'firebase-admin';

export interface UserToken {
  expoPushToken: string;
}

export interface ChatMessage {
  createdAt: admin.firestore.Timestamp;
  receiverSlug: string;
  senderName?: string;
  text: string;
}