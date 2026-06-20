# BoardTAU Technical Defense Reviewer
## Comprehensive Guide for System Architecture & Implementation

This document serves as a specialized reviewer for the technical implementation of BoardTAU, covering Maps, Authentication, Payments, and Webhook flows.

---

### 1. Maps: Leaflet vs. Google Maps
**Q: Why did we choose Leaflet over Google Maps?**

| Feature | **Leaflet (Current)** | **Google Maps** |
| :--- | :--- | :--- |
| **Cost** | 100% Free / Open Source | Paid (requires Credit Card / API Key) |
| **Data Source** | OpenStreetMap (OSM) | Google Proprietary Data |
| **Customization** | Full control via CSS/SVG | Limited to Google's API rules |
| **Weight** | Very lightweight (~39KB) | Heavier script loading |

**Key Justification:** For our capstone, Leaflet provides perfect functionality for coordinate selection and map display without the overhead of API keys or monthly billing.

---

### 2. Authentication: JSON Web Token (JWT)
**Q: What is a JWT and how is it used in BoardTAU?**
A JWT is a digitally signed, tamper-proof object used to transmit user identity.

*   **Implementation:** Managed by `NextAuth.js` via the `session: { strategy: "jwt" }` configuration.
*   **Payload:** Stores the `id`, `role` (Admin/Landlord), and `emailVerified` status.
*   **Advantage in Middleware:** Since the user's role is "baked" into the token, our `middleware.ts` can instantly check permissions for `/admin` or `/landlord` routes without constant database lookups.

---

### 3. Payments: Stripe & PayMongo
**Q: How do we handle payments and why use two providers?**

*   **Stripe:** Used for international Credit/Debit card processing.
*   **PayMongo:** Integrated via custom API for local Philippine methods (**GCash** and **Maya**).
*   **Advantages:**
    1.  **Inclusion:** Allows students without credit cards to pay via GCash.
    2.  **Compliance:** PCI-DSS compliance is handled by the providers (we never store card numbers).
    3.  **Mock Mode:** Includes a simulation mode for PayMongo to ensure the defense demo works even without live merchant keys.

---

### 4. Webhooks: "The Digital Doorbell"
**Q: What is a Webhook and how does the flow work?**
A Webhook is an HTTP callback where an external server (Stripe) acts as the **Client** and calls **Our Server** to report an event.

**The "Success Scenario":**
1.  **Payment:** Student pays on Stripe's website.
2.  **Notification:** Stripe sends a `POST` request to our `/api/webhooks/stripe` endpoint.
3.  **Validation:** Our server verifies the signature (security).
4.  **Database Update:** Our server automatically updates the reservation to `PAID` and reduces `availableSlots`.

**Q: Webhook vs. WebSocket?**
*   **Webhook:** One-way notification (Event $\rightarrow$ Notification). Best for payments.
*   **WebSocket:** Two-way, persistent connection. Best for real-time chat or live video.

---

### 5. Summary for Panel Questions
*   **"Is the system secure?"** Yes, we use JWT for session security and Webhook Signature Verification to ensure payment data is authentic.
*   **"Can it scale?"** Yes, the JWT strategy is stateless (better for many users), and our payment providers (Stripe/PayMongo) can handle thousands of transactions.
*   **"What if there's no internet?"** Our PayMongo service includes a **Mock/Simulation mode** specifically designed for local demonstrations.
