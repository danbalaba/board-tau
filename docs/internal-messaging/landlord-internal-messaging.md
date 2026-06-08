# Landlord Internal Messaging: Implementation Plan

## 1. Objective
Expand the internal messaging system to provide Landlords with a professional, centralized "Messaging Hub" (Inbox). This feature will align with the existing **Domain-Driven Architecture** and ensure zero security vulnerabilities through strict ownership checks and input sanitization.

---

## 2. Security & Sanitization
*   **XSS Protection**: All message content will be sanitized using `validator.escape()` before being persisted to the database.
*   **Authorization**: Every API request will verify that the requesting user has the `LANDLORD` role and explicitly owns the `Listing` related to the conversation.
*   **No "Leakage"**: Landlords will only be able to query messages where they are one of the participants (sender or receiver).

---

## 3. Layered Implementation

### Phase A: Service Layer (`services/landlord/messages.ts`)
*   `getLandlordConversations()`: 
    *   Query the `Message` table for all messages involving the landlord.
    *   Group messages by `ListingId` and `OtherUserId` (the Tenant).
    *   Return the "Last Message" snippet, "Timestamp", and "Unread Count" for each conversation.
*   `getConversationMessages(tenantId, listingId)`: Fetch the full message history for a specific conversation.

### Phase B: API Layer (`app/api/landlord/messages/route.ts`)
*   **GET**: Calls the service to return the list of active conversations for the inbox sidebar.
*   **POST**: Handles sending a message from the landlord side, ensuring real-time Pusher triggers and Notification creation.

### Phase C: UI Layer (`app/landlord/features/messaging-hub/`)
*   `index.tsx`: The full-screen Inbox layout.
*   `components/ConversationsList.tsx`: Left sidebar with search, filters (All/Unread), and user cards (Avatar + Last Message).
*   `components/ChatWindow.tsx`: The main chat panel using our existing `ChatModal` logic but integrated as a persistent view.
*   `hooks/use-messaging-hub.ts`: Handles active conversation state, polling/pusher logic, and scrolling.

---

## 4. Real-time Notifications
*   When a tenant sends a message:
    1.  Create `Message` record.
    2.  Create `Notification` record (type: 'message').
    3.  Trigger Pusher event: `new-message` on the landlord's channel.
    4.  Update the **Landlord Sidebar** notification badge instantly.

---

## 5. Visual Aesthetics (The "SaaS" Look)
*   Adopt the professional 2-column "SaaS" mockup design.
*   Use `backdrop-blur-md` and `bg-white/95` for a premium, airy feel.
*   Implement "Seen" status indicators for read messages.

---

## 6. Success Criteria
- [ ] Landlord can see all tenant conversations in one place.
- [ ] Landlord can reply to tenants directly from the Inbox.
- [ ] All inputs are sanitized using `validator.escape()`.
- [ ] Real-time updates occur without page refreshes.
- [ ] Notifications appear correctly in the Landlord's top bar.
