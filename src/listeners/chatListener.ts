import { db } from '../config/firebase';
import { sendPushNotification } from '../services/expoService';
import * as admin from 'firebase-admin';
import { ChatMessage, UserToken } from '../types';

// Track health status
export let isListenerActive = false;

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
              const { receiverSlug, senderName = "Someone", text } = messageData;

              if (!receiverSlug || !text) continue;

              const userDoc = await db.collection('userTokens').doc(receiverSlug).get();
              
              if (userDoc.exists) {
                const data = userDoc.data() as UserToken;
                if (data?.expoPushToken) {
                  await sendPushNotification(data.expoPushToken, senderName, text);
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