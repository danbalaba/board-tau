# Implementation Plan: GCash and Maya Integration via PayMongo

## 1. Overview
This plan outlines the integration of **GCash** and **Maya** as primary payment methods for BoardTAU. Since most students in the Philippines use e-wallets instead of credit cards, this update is critical for user accessibility and realistic testing of the reservation flow.

**Primary Gateway:** PayMongo (Selected for its robust PHP-market support and developer-friendly Test Mode).

---

## 2. Goals
- [ ] Enable GCash and Maya options in the `InquiryModal`.
- [ ] Create a dedicated Payment Service for PayMongo.
- [ ] Implement a Webhook listener for secure, asynchronous payment confirmation.
- [ ] Support a "Test Mode" for simulation during capstone defense without real money.

---

## 3. Architecture & File Structure

### New Files to be Created:
- **`services/payments/paymongo.ts`**  
  *The core logic for talking to the PayMongo API (Creating Sources, Sessions, and handling signatures).*
- **`app/api/payments/paymongo/checkout/route.ts`**  
  *API endpoint that triggers the creation of a PayMongo checkout session.*
- **`app/api/webhooks/paymongo/route.ts`**  
  *The "Doorbell" for your server. Securely receives payment confirmations from PayMongo.*

### Existing Files to be Modified:
- **`components/modals/InquiryModal.tsx`**  
  *Unlock the GCash/Maya radio buttons and add the redirect logic upon inquiry submission.*
- **`.env`** (User Action Required)  
  *Add `PAYMONGO_SECRET_KEY` and `PAYMONGO_PUBLIC_KEY`.*

---

## 4. Implementation Workflow

### Step 1: The Modal (Frontend)
- **Currently:** GCash and Maya buttons are disabled with `opacity-50`.
- **Change:** Enable these buttons and update the `onSubmitForm` function.
- **Logic:** If `paymentMethod === 'gcash' | 'maya'`, redirected to the custom PayMongo checkout route instead of Stripe.

### Step 2: The Service Layer (Backend Logic)
- Create `services/payments/paymongo.ts`.
- **Function:** `createPayMongoCheckout(inquiryId: string, method: 'gcash' | 'paymaya')`.
- This function will create a "Source" or "Checkout Session" and return the `redirect_url` provided by the gateway.

### Step 3: The Webhook (The Source of Truth)
- Create `app/api/webhooks/paymongo/route.ts`.
- **Important:** This route must verify the signature headers to prevent malicious users from "faking" a payment.
- **On Success:** Update `Inquiry.paymentStatus = "PAID"` and `Inquiry.status = "APPROVED"`.
- **On Success:** Decrease `Room.availableSlots` by 1 to prevent double-booking.

### Step 4: Testing & Simulation
- **Simulator Mode:** We will add a toggle in the service that allows us to skip the real API call and just "Simulate Success" for testing purposes if no API keys are present.

---

## 5. Security Checklist
- [ ] **Secret Keys:** Never expose the `SECRET_KEY` on the client-side (files starting with `use client`).
- [ ] **Signature Verification:** Always verify webhooks before updating the database.
- [ ] **Data Sanitization:** Ensure `inquiryId` passed from the frontend is valid before processing.

---

## 6. Comparison: Stripe vs. PayMongo
| Feature | Stripe (Current) | PayMongo (New) |
| :--- | :--- | :--- |
| **Primary Method** | Credit/Debit Cards | GCash, Maya, Cards |
| **PH Support** | Global Focused | PH Focused (GCash/Maya) |
| **Testing** | Test Card Numbers | Test E-Wallet Logins |
| **Webhook Required?** | Yes | Yes (Mandatory for E-Wallets) |

---

## 7. Future Proofing
This implementation will allow BoardTAU to easily add other local methods in the future (like GrabPay or BillEase) because the service layer is modular.

---
*Created on: 2026-04-07*
*Project: BoardTAU Capstone*
