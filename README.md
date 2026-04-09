# 🚀 Varsigram Notification Watchdog

An event-driven Node.js microservice built to handle real-time push notifications for the Varsigram mobile application. 

## 🏗 Architecture 
This standalone worker operates as a "Watchdog" for the Varsigram backend. It securely connects to Google Cloud Firestore, listens for new messages globally, and dispatches push notifications directly to user devices.

### Core Flow:
1. Attaches a `.onSnapshot()` listener to the `messages` Collection Group.
2. Detects new chat messages in real-time.
3. Queries the `userTokens` collection for the recipient's Expo Push Token.
4. Fires the push notification via the `expo-server-sdk`.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Database SDK:** `firebase-admin`
- **Notifications:** `expo-server-sdk`
- **Server:** Express (for platform health checks and graceful shutdowns)

## ⚙️ Local Development Setup

### 1. Clone & Install
```bash
git clone [https://github.com/varsigram2024/varsigram_notifications.git](https://github.com/varsigram2024/varsigram_notifications.git)
cd varsigram_notifications
npm install