# Internal Messaging (Tenant ↔ Landlord) — Implementation Plan

## Context and goals

BoardTAU already supports a full inquiry → reservation lifecycle, but communication between tenant and landlord is currently fragmented (notes in inquiry, email notifications, preferred contact method like email/phone/sms). This feature introduces **in-app internal messaging** so tenants and landlords can have a continuous conversation tied to a listing throughout the journey.

### What we’re building (MVP)

- **1:1 messaging** between:
  - **Tenant / end user** ↔ **Landlord**
- **No attachments** (text-only)
- **Modern chat UI** implemented as a **modal** (not a separate page)
- **Contextual conversations per listing**:
  - Chat route key: `/messages/[listingId]/[otherUserId]`
  - Persist context by storing `listingId` on each message
- **Notifications**:
  - When a message is sent, create an in-app notification for the receiver with `type: "message"`.
  - Notification `link` points to the chat route so users can jump directly into the conversation.

## Non-goals (for MVP)

- Group chat
- Admin/support conversations
- File uploads / voice notes
- Read receipts beyond basic “read/unread” state
- Real-time WebSockets/SSE (MVP uses polling / refetch)

## Tech stack and libraries (existing + planned usage)

- **Next.js App Router** (route handlers + server actions where appropriate)
- **Prisma** with **MongoDB**
- **Auth/session**: reuse existing `getCurrentUser()` patterns
- **UI**:
  - Tailwind (existing styling system)
  - **Lucide React** icons (consistent with existing UI)
  - **Framer Motion** for modal + message animations
- **Data fetching**:
  - Keep consistent with current patterns (e.g., React Query is used for landlord notifications)
  - For MVP, message list can refetch on an interval while the chat is open

## Data model plan (Option A — minimal schema changes)

BoardTAU already has a `Message` model in `prisma/schema.prisma`:

- `senderId`, `receiverId`, `content`, `read`, `createdAt`

### Proposed MVP schema change

Add contextual fields so messages can be grouped by listing:

- `listingId: String @db.ObjectId`

Optional (useful later, not required for MVP):

- `inquiryId?: String @db.ObjectId`
- `reservationId?: String @db.ObjectId`

**Threading rule (MVP)**:

- A “conversation” is defined by:
  - `listingId`
  - 2 participants (tenant + landlord)
- Messages are queried with:
  - `listingId`
  - `(senderId == me && receiverId == other) OR (senderId == other && receiverId == me)`

This keeps a single continuous history even as the relationship moves from **Inquiry** to **Reservation**.

## Backend structure

### API routes (route handlers)

Create:

- `app/api/messages/route.ts`

#### `GET /api/messages?listingId=...&otherUserId=...&cursor=...`

Purpose:

- Fetch messages for the current user with `otherUserId` scoped to `listingId`

Behavior:

- Auth required (current user must be sender/receiver)
- Sort by `createdAt` descending (or ascending, depending on UI)
- Support pagination/infinite scroll using a cursor (Mongo objectId or timestamp)

Response shape (example):

```json
{
  "messages": [
    { "id": "...", "senderId": "...", "receiverId": "...", "content": "...", "read": false, "createdAt": "..." }
  ],
  "nextCursor": "..."
}
```

#### `POST /api/messages`

Body (example):

```json
{
  "listingId": "...",
  "receiverId": "...",
  "content": "Hi! Can I move in earlier?"
}
```

Behavior:

- Auth required
- Validate:
  - `content` non-empty, length cap (e.g., 1–2000 chars)
  - sender cannot message themselves
  - receiver exists
  - access control: ensure the sender is allowed to message receiver for this listing (see Access Control section)
- Create `Message` row with `senderId = currentUser.id`
- Create receiver notification:
  - `type: "message"`
  - `title`: e.g. `New message`
  - `description`: e.g. `${senderName}: ${contentPreview}`
  - `link`: `/messages/${listingId}/${senderId}` (so receiver opens the correct chat)

Response:

- Return created message

### Access control (important)

To prevent random DMs, enforce at least one of these policies:

**Policy A (strict, recommended)**:
- Tenant can message landlord only if:
  - Tenant has an inquiry OR reservation for that `listingId` (any status), and
  - Landlord is the owner (`Listing.userId`) of that listing

**Policy B (looser)**:
- Tenant can message landlord if listing exists and landlord owns it (allows pre-inquiry chat).

We’ll implement Policy A first unless product requires pre-inquiry chat.

## Frontend design plan

### Entry points (where “Chat landlord” appears)

Tenant side:

- In inquiry views:
  - `components/inquiries/InquiryCard.tsx` and/or `components/inquiries/InquiryDetailsModal.tsx`
  - CTA: **Chat landlord**
- In reservation views:
  - `components/reservations/ReservationCard.tsx` and/or `components/reservations/ReservationDetailsModal.tsx`
  - CTA: **Message**

Landlord side:

- Notifications dropdown already supports `type: "message"`
  - clicking notification should open the chat modal (deep link)

### Chat modal UX (MVP)

**Header**
- Listing title
- Counterparty name (tenant or landlord)
- Context chips:
  - Inquiry status (if exists)
  - Reservation status (if exists)

**Body**
- Scrollable message list
- Bubbles:
  - outgoing (current user) on right
  - incoming on left
- Timestamp display (subtle)
- Smooth transitions (Framer Motion)

**Composer**
- Text input
- Send button (Lucide icon)
- Disabled state while sending

**Polling**
- While modal is open:
  - refetch messages every 2–5 seconds
  - also refetch immediately after sending

### Routing strategy (Option A, modal-first)

Even though chat is a modal, we still want **URL-addressable state** so notifications can deep-link.

We’ll use:

- Route: `/messages/[listingId]/[otherUserId]`

Implementation approach:

- Use a lightweight route that renders the normal page shell and auto-opens the chat modal.
- Alternatively, wire this into an existing global modal system if present.

## File plan (create vs modify)

### Create (new)

- `docs/internal-messaging/implementation-plan.md` (this document)
- `app/api/messages/route.ts`
- `components/messages/ChatModal.tsx`
- `components/messages/ChatWindow.tsx`
- `components/messages/MessageBubble.tsx` (optional, but clean)
- `app/messages/[listingId]/[otherUserId]/page.tsx` (route that opens the modal)

### Modify (existing)

- `prisma/schema.prisma` (add `Message.listingId`)
- `components/inquiries/InquiryCard.tsx` and/or `components/inquiries/InquiryDetailsModal.tsx` (add Chat CTA)
- `components/reservations/ReservationCard.tsx` and/or `components/reservations/ReservationDetailsModal.tsx` (add Message CTA)
- Notification creation call sites (use existing `createNotification`):
  - ensure message notification link routes to `/messages/[listingId]/[otherUserId]`

## Testing plan (manual MVP)

- Tenant sends inquiry → open inquiry details → open chat → send message
- Landlord receives in-app notification → click → chat opens → reply
- Verify:
  - message history persists
  - only the two participants can access the chat URL
  - messages are scoped to the correct listing
  - basic unread/read behavior works (or at least messages render correctly)

## Future enhancements

- True realtime (WebSockets/SSE)
- Conversation list page (`/messages`) showing recent chats
- Better read receipts (`readAt`)
- Attachments (images/docs)
- Soft-delete / moderation tools

