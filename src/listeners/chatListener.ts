import { db } from '../config/firebase';
import { sendPushNotification } from '../services/expoService';
import * as admin from 'firebase-admin';
import { ChatMessage, ConversationType, UserToken } from '../types';

// Track health status
export let isListenerActive = false;

const ALLOWED_CONVERSATION_TYPES: ConversationType[] = ['personal', 'group', 'room'];

export const startChatListener = () => {
  const serverStartTime = admin.firestore.Timestamp.now();
  console.log(" Firebase Watchdog is live and listening for new messages...");

  const unsubscribe = db.collectionGroup('messages')
    .where('createdAt', '>', serverStartTime)
    .onSnapshot(
      async (snapshot) => {
        isListenerActive = true; // Mark as healthy
        
        // Using for...of instead of forEach to handle async properly
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            try {
              const messageData = change.doc.data() as ChatMessage;
              const {
                receiverSlug,
                senderId,
                senderName = 'Someone',
                text,
                conversation_id,
                conversation_type,
                isSystem,
                type,
              } = messageData;

              if (!receiverSlug || !text) continue;
              if (isSystem || type === 'system') continue;
              if (senderId && senderId === receiverSlug) continue;
              if (!conversation_id || !conversation_type) continue;
              if (!ALLOWED_CONVERSATION_TYPES.includes(conversation_type)) continue;

              const userDoc = await db.collection('userTokens').doc(receiverSlug).get();
              
              if (userDoc.exists) {
                const data = userDoc.data() as UserToken;
                if (data?.expoPushToken) {
                  await sendPushNotification(data.expoPushToken, senderName, text, {
                    type: 'message',
                    conversation_id,
                    conversation_type,
                    sender_id: senderId,
                  });
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error(`Error processing message for ${change.doc.id}:`, errorMessage);
            }
          }
        }
      },
      (error) => {
        isListenerActive = false; // Mark as unhealthy if it fails
        console.error('Snapshot listener crashed:', error);
      }
    );

  // Return this so index.ts can kill it later
  return unsubscribe; 
};