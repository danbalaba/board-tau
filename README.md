<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/TauBOARD-Dark.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/TauBOARD-Light.png">
    <img alt="BoardTAU Logo" src="public/images/TauBOARD-Light.png" width="400">
  </picture>
</div>

# BoardTAU 🎓🏡
> **A Modernized and Interactive Web System for Boarding Houses Near Tarlac Agricultural University**

**Live Platform:** [https://board-tau-rho.vercel.app/](https://board-tau-rho.vercel.app/)

---

## 📖 Executive Summary
Choosing suitable accommodation is a major challenge faced by students, faculty, and staff coming from distant areas to Tarlac Agricultural University (TAU). Traditional methods of finding boarding houses—relying on posters, word-of-mouth, and door-to-door inquiries—are inefficient, lack transparency, and leave tenants vulnerable to rental scams. 

**BoardTAU** addresses this gap by providing a centralized, secure, and interactive web-based platform. Built using an enterprise-grade modern technology stack, it facilitates seamless discovery, secure booking, and efficient management of boarding houses, apartments, and dormitories within Tarlac Province.

## 🎯 Sustainable Development Goals (SDGs)
This Capstone Project proudly supports:
* **SDG 9: Industry, Innovation, and Infrastructure:** By introducing a modernized, digital infrastructure to replace traditional manual housing searches.
* **SDG 4: Quality Education:** By ensuring the academic community has convenient access to safe and affordable housing, allowing them to focus on their educational and professional priorities.

---

## 🌟 Core System Modules & Objectives

The platform is designed with **Adaptive Design** for desktop and mobile, divided into four distinct user interfaces:

### 1. End User (Tenant) Interface
* **Intelligent Discovery:** Multi-step filtering based on location, price, room type, amenities, and house rules.
* **Interactive Mapping:** Visual property discovery powered by Leaflet.
* **AI-Powered Assistance:** Side-by-side boarding house comparisons and a Gemini-powered chatbot for data-driven recommendations.
* **Secure Bookings:** Submit inquiries and reservation requests using biometric identity verification (MediaPipe).
* **Digital Payments:** Secure reservation fee processing via Stripe (Credit/Debit) and PayMongo (GCash, Maya).

### 2. Landlord (Property Owner) Interface
* **Property Management:** Create and manage rich listings, including room types, bed types, and real-time availability statuses.
* **Booking Pipeline:** Process tenant inquiries, manage check-ins, and track booking completions.
* **Real-Time Communication:** Direct in-app messaging with potential tenants (powered by Pusher).
* **Business Analytics:** Automated dashboards with downloadable PDF/CSV financial reports to monitor business growth.

### 3. System Administrator Interface
* **Content Moderation:** Review and approve new host applications and pending property listings.
* **Community Standards:** Review user feedback, flag inappropriate ratings, and enforce temporary account restrictions.

### 4. Super Administrator Interface
* **Enterprise Oversight:** Manage the user directory, enforce permanent bans, and oversee role assignments.
* **System Health:** Track platform-wide analytics, transaction logs, and operational health metrics.

---

## 🛠️ Technology Stack & Architecture

BoardTAU migrates away from traditional legacy architectures (like PHP/MySQL) in favor of a modern, scalable, and highly secure JavaScript ecosystem.

### Frontend
* **Framework:** Next.js 16 (App Router) for Server-Side Rendering (SSR) and optimized performance.
* **UI/Styling:** React 19, Tailwind CSS, Radix UI, Framer Motion for adaptive, accessible, and fluid interfaces.
* **State Management:** TanStack Query (server state caching) and Zustand (client state).

### Backend & Database
* **Database:** MongoDB (Atlas) for flexible, NoSQL document-oriented storage.
* **ORM:** Prisma for type-safe database querying and schema management.
* **Caching Layer:** Upstash Redis to reduce database load and accelerate frequent queries.
* **File Storage:** EdgeStore for secure handling of high-resolution property images and KYC documents.

### Security & Integrations
* **Authentication:** NextAuth.js with JWT session management and OTP verification (Resend + React Email).
* **Biometric Security (KYC):** Google MediaPipe for face and blink detection (Liveness Detection).
* **Payment Gateways:** Stripe (International) and PayMongo (Local Philippine E-wallets).
* **Real-Time WebSockets:** Pusher with AES-256-GCM encryption for secure messaging.
* **Artificial Intelligence:** Google Generative AI (Gemini) for the recommendation engine and chatbot.

---

## 🔬 Development Methodology

This project was developed strictly adhering to the **Agile Software Development Methodology**:
1. **Brainstorming:** Extensive surveys and structured interviews with TAU stakeholders.
2. **Design:** Wireframing via Figma, architecture mapping via Eraser.io, and UML/IPO modeling via MS Visio.
3. **Development:** Iterative implementation of frontend, backend, and third-party integrations.
4. **Testing:** Rigorous Unit Testing, Integration Testing, and a full Vulnerability and Penetration Test (VAPT) to evaluate ISO/IEC 25010 standards (Usability and Functionality).
5. **Deployment:** Continuous Integration/Continuous Deployment (CI/CD) pipeline via Vercel.

---

## 🚀 Local Setup & Installation

To run this Capstone Project locally for testing or further research:

### Prerequisites
* Node.js (v20+)
* Git
* A MongoDB Database Cluster

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/danbalaba/board-tau.git
   cd board-tau
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory. You will need API keys for the following services:

   ```env
   # Database & ORM
   DATABASE_URL=

   # Upstash Redis (Caching & Rate Limiting)
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

   # NextAuth Authentication
   FACEBOOK_CLIENT_ID=
   FACEBOOK_CLIENT_SECRET=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_SECRET=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000

   # EdgeStore (Cloud Storage)
   EDGE_STORE_ACCESS_KEY=
   EDGE_STORE_SECRET_KEY=

   # Payment Gateways
   STRIPE_SECRET_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=
   PAYMONGO_SECRET_KEY=
   PAYMONGO_PUBLIC_KEY=
   PAYMONGO_WEBHOOK_SECRET=

   # Email Service (Resend)
   RESEND_API_KEY=
   EMAIL_FROM="BoardTAU <support@boardtau.xyz>"
   OTP_SECRET=

   # Artificial Intelligence
   GEMINI_API_KEY=

   # Pusher (Real-Time WebSockets)
   NEXT_PUBLIC_PUSHER_APP_KEY=
   PUSHER_APP_ID=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=
   MESSAGE_ENCRYPTION_KEY=

   # Analytics & Error Tracking
   NEXT_PUBLIC_POSTHOG_KEY=
   SENTRY_AUTH_TOKEN=
   ```

4. **Initialize Prisma Database**
   ```bash
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *Navigate to `http://localhost:3000` to view the application.*

---

## 📬 Support & Contact

**Email:** [support@boardtau.xyz](mailto:support@boardtau.xyz)

*Created for Tarlac Agricultural University by Jerome R. Autida, Dan Richie L. Balaba, Marc Jason G. Gonzales, and John Roldan T. Simon (December 2026).*
