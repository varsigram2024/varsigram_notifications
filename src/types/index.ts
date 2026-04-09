import * as admin from 'firebase-admin';

export interface UserToken {
  expoPushToken: string | null;
}

export type ConversationType = 'personal' | 'group' | 'room';

export interface ChatMessage {
  createdAt: admin.firestore.Timestamp;
  receiverSlug: string;
  senderId?: string;
  senderName?: string;
  text: string;
  conversation_id?: string;
  conversation_type?: ConversationType;
  isSystem?: boolean;
  type?: string;
}