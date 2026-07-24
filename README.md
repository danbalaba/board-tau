# BoardTAU 🎓🏡

> **A Modernized and Interactive Web System for Boarding Houses Near Tarlac Agricultural University**

![BoardTAU Hero Image](https://board-tau-rho.vercel.app/og-image.png)

Welcome to the official repository for **BoardTAU**, a comprehensive Capstone Project designed to revolutionize how students, faculty, and staff discover, book, and manage boarding houses near Tarlac Agricultural University (TAU).

**Live Website:** [https://board-tau-rho.vercel.app/](https://board-tau-rho.vercel.app/)

---

## 📖 About The Project

Finding suitable and secure accommodation is a major challenge for the TAU community. Traditional methods are time-consuming and lack transparency. **BoardTAU** bridges the gap by providing a centralized, interactive, and intelligent platform.

It is designed with **Adaptive Design** to work flawlessly across desktop, tablet, and mobile devices, providing dedicated features for End Users (Tenants), Landlords, System Administrators, and Super Administrators.

### ✨ Key Features
- **Intelligent Discovery:** Multi-step filtering, Interactive Map (Leaflet), and AI-Powered comparisons (Gemini).
- **Secure Bookings:** Real-time room availability and strict booking workflows.
- **Dual Payment Gateways:** Seamless payments via Stripe (Card) and PayMongo (GCash, Maya).
- **Advanced Security:** Strict KYC (Know Your Customer) processes featuring biometric liveness detection (MediaPipe).
- **Real-Time Communication:** Live in-app messaging between tenants and landlords (Pusher) with AES-256-GCM encryption.
- **Landlord Analytics:** Automated dashboards for property performance and financial reporting.

---

## 🛠️ Technology Stack

BoardTAU is built using a modern, enterprise-grade architecture:

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS, Radix UI, Framer Motion
- **State Management:** Zustand, TanStack Query

### Backend & Database
- **Database:** MongoDB (Atlas)
- **ORM:** Prisma
- **Caching & Rate Limiting:** Upstash Redis
- **Storage:** EdgeStore

### Integrations & AI
- **Authentication:** NextAuth.js
- **Generative AI:** Google Gemini (Recommendations & Chatbot)
- **Payments:** Stripe, PayMongo
- **Real-Time:** Pusher Websockets
- **Computer Vision:** MediaPipe (Liveness Detection)
- **Email:** Resend, React Email

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- Node.js (v20 or higher recommended)
- Git
- A MongoDB Database URL
- Accounts for third-party services (Stripe, PayMongo, Pusher, Upstash, Resend, Gemini, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danbalaba/board-tau.git
   cd board-tau
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and configure the following variables:

   ```env
   # Database
   DATABASE_URL=

   # Upstash Redis (Caching)
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

   # Authentication
   FACEBOOK_CLIENT_ID=
   FACEBOOK_CLIENT_SECRET=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_SECRET=
   
   # Local development URLs (uncomment when developing locally)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000

   # EdgeStore (File Storage)
   EDGE_STORE_ACCESS_KEY=
   EDGE_STORE_SECRET_KEY=

   # Stripe Payments
   STRIPE_SECRET_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=

   # PayMongo Payments
   PAYMONGO_SECRET_KEY=
   PAYMONGO_PUBLIC_KEY=
   PAYMONGO_WEBHOOK_SECRET=

   # Email (Resend)
   RESEND_API_KEY=
   EMAIL_FROM=
   OTP_SECRET=

   # Google Gemini AI
   GEMINI_API_KEY=

   # Pusher (Real-Time Messaging)
   NEXT_PUBLIC_PUSHER_APP_KEY=
   PUSHER_APP_ID=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=
   MESSAGE_ENCRYPTION_KEY=

   # PostHog Analytics
   NEXT_PUBLIC_POSTHOG_KEY=

   # Sentry Error Tracking
   SENTRY_AUTH_TOKEN=
   ```

4. **Initialize Prisma**
   ```bash
   npx prisma generate
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   Navigate to `http://localhost:3000` in your web browser.

---

## 📬 Support & Contact

If you have any questions or encounter issues, please reach out to the development team:

**Email:** `support@boardtau.xyz`

*Note: For official university inquiries regarding boarding houses, please contact the respective property owners directly through the platform.*

---
*Created for Tarlac Agricultural University by Jerome R. Autida, Dan Richie L. Balaba, Marc Jason G. Gonzales, and John Roldan T. Simon (December 2026).*
