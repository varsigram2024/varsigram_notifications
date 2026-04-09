# Chat Notifications Backend (A to Z)

This document defines the current chat notification backend behavior, the contract expected by frontend, and the next hardening steps.

---

## 1) Goal

Provide reliable chat push notifications using Firestore + Expo Server SDK.

Core principle:
- Frontend writes Expo token to `userTokens/{userId}.expoPushToken`.
- Backend Watchdog listens for new chat messages.
- Backend sends push with routing payload so app opens the correct conversation.

---

## 2) Current Backend Scope

- Runtime: Node.js + TypeScript
- DB SDK: `firebase-admin` (Firestore)
- Push provider: `expo-server-sdk`
- Worker model: Firestore realtime listener (`collectionGroup("messages")`)
- Health endpoint: Express `/health`

---

## 3) Current Flow (Implemented)

1. Worker starts and initializes Firebase Admin.
2. Listener attaches to Firestore `messages` collection group.
3. For each new message:
   - reads recipient id (`receiverSlug` / user id)
   - loads token from `userTokens/{recipientId}.expoPushToken`
4. Validates token with Expo token check.
5. Sends push via Expo SDK.

---

## 4) Required Frontend/Backend Contract

### Firestore token source of truth
- Path: `userTokens/{userId}`
- Field: `expoPushToken` (string or null)

### Message fields required for chat notification
- `receiverSlug` (or recipient user id)
- `text`
- `senderName` (optional fallback supported)
- `conversation_id` (required for routing)
- `conversation_type` (`personal | group | room`)
- `sender_id` (optional but recommended)

---

## 5) Push Payload Contract (Must Send)

Backend should send notification `data`:

```json
{
  "type": "message",
  "conversation_id": "abc123",
  "conversation_type": "personal",
  "sender_id": "sender-slug"
}
```

Notes:
- `type: "message"` = notification category.
- `conversation_type` = chat kind (`personal | group | room`).
- Frontend may still support legacy fallback keys, but backend should prefer the new format.

---

## 6) Go/No-Go Checklist

### Required (Go-live minimum)
- [ ] Read token from `userTokens/{userId}.expoPushToken`
- [ ] Validate Expo token format before send
- [ ] Send with Expo SDK
- [ ] Include payload `data.type = "message"`
- [ ] Include `conversation_id`
- [ ] Include `conversation_type`
- [ ] Safely skip null/missing tokens

### Recommended (Next hardening)
- [ ] Exclude sender from recipients
- [ ] Skip system messages
- [ ] Chunk notifications (`expo.chunkPushNotifications`)
- [ ] Process Expo tickets/receipts
- [ ] Prune invalid/unregistered tokens
- [ ] Add idempotency/dedupe guard
- [ ] Improve health signal (attached vs active)

---

## 7) Reliability Notes

Known limits in simple listener setups:
- Downtime gaps can miss notifications if only using `createdAt > processStart`.
- Duplicate sends can happen on reconnect/retry without idempotency.
- Health can look unhealthy before first snapshot event if not modeled carefully.

---

## 8) Security Rules Expectations

Firestore rules should allow:
- Client write to own token doc:
  - `userTokens/{uid}` where `request.auth.uid == uid`
- Backend/Admin reads token docs for recipients.
- Chat message writes include fields required by notification flow.

---

## 9) Manual QA Checklist

- [ ] Token doc exists: `userTokens/{userId}.expoPushToken`
- [ ] New message triggers push send log
- [ ] Push includes `conversation_id` + `conversation_type`
- [ ] Tap opens correct chat on device
- [ ] Null token path is skipped safely
- [ ] Invalid token logs expected warning
- [ ] Sender does not receive self-notification (when implemented)

---

## 10) Summary

Backend is Firestore-driven and Expo-powered. Success depends on payload consistency (`conversation_id`, `conversation_type`) and token hygiene (`userTokens/{userId}.expoPushToken`).

Production reliability should add chunking, receipts, cleanup, dedupe, and downtime-safe processing.