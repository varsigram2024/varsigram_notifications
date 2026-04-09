import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Safely parse the giant JSON string
const serviceAccount = (() => {
  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '');
  } catch (error) {
    console.error(' Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Check your .env file!');
    process.exit(1);
  }
})();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();