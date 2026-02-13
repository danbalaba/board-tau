# BoardTAU: A Modernized and Interactive Web System for Boarding Houses Near Tarlac Agricultural University

![BoardTAU Logo](public/logo.png)

## 🎯 About BoardTAU

BoardTAU is a comprehensive web-based platform designed to revolutionize the search and management of boarding houses near Tarlac Agricultural University (TAU). Our mission is to provide students, faculty, and staff with a seamless experience in finding safe, affordable, and suitable accommodations that meet their unique needs.

### 🌟 Key Features

#### For Tenants
- **Advanced Search & Filtering**: Find boarding houses by college affiliation, distance, category, price range, amenities, and more
- **Interactive Map**: Visualize properties on an interactive map with distance calculations
- **Comprehensive Listings**: Detailed property information with photos, amenities, room types, and ratings
- **Inquiry System**: Direct messaging with property owners
- **Favorites & Bookmarks**: Save properties for future reference
- **Reviews & Ratings**: Real user reviews and ratings to help make informed decisions

#### For Landlords
- **Property Management Dashboard**: Easy listing creation and management
- **Reservation Management**: Track bookings and inquiries
- **Analytics**: Insights into property performance and booking trends
- **Communication Tools**: Direct messaging with potential tenants
- **Availability Management**: Real-time availability updates

#### For Administrators
- **System Dashboard**: Comprehensive overview of platform activity
- **User Management**: Monitor and manage all user accounts
- **Content Moderation**: Review and approve property listings and reviews
- **Analytics**: Detailed reports on platform usage and performance
- **System Settings**: Configure platform preferences and settings

### 🛠️ Technology Stack

#### Frontend
- **Next.js 16**: React framework with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form management
- **React Leaflet**: Interactive maps
- **Recharts**: Data visualization charts

#### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database management
- **MongoDB**: NoSQL database
- **NextAuth.js**: Authentication and authorization
- **NodeMailer**: Email notifications

#### File Storage & Payments
- **EdgeStore**: Image and file storage
- **Stripe**: Payment processing integration

#### Other Features
- **OTP Verification**: Secure email verification
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Customizable user experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Stripe account (for payments)
- EdgeStore account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danbalaba/board-tau-master.git
   cd board-tau-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Next Auth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Database
   DATABASE_URL=mongodb+srv://your_mongodb_uri

   # Stripe
   STRIPE_API_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Email (SMTP)
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=your_email@gmail.com

   # EdgeStore
   EDGE_STORE_ACCESS_KEY=your_edgestore_access_key
   EDGE_STORE_SECRET_KEY=your_edgestore_secret_key
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Tenant Guide

1. **Create an Account**: Sign up with your email and verify your account via OTP
2. **Search for Properties**: Use the advanced search filters to find suitable properties
3. **Browse Listings**: View detailed property information, photos, and reviews
4. **Send Inquiries**: Contact property owners directly through the platform
5. **Book Properties**: Make reservations and manage your bookings
6. **Leave Reviews**: Share your experiences with other users

### Landlord Guide

1. **Create a Landlord Account**: Sign up and verify your identity
2. **Add Properties**: Create detailed property listings with photos and information
3. **Manage Listings**: Update availability, prices, and property details
4. **Respond to Inquiries**: Reply to tenant inquiries and booking requests
5. **Track Bookings**: Manage reservations and track payment status
6. **View Analytics**: Monitor property performance and booking trends

### Administrator Guide

1. **Access Admin Panel**: Navigate to `/admin` and log in with admin credentials
2. **Manage Users**: Monitor and manage user accounts
3. **Moderate Content**: Review and approve property listings and reviews
4. **View Reports**: Access detailed analytics and performance reports
5. **Configure Settings**: Manage platform preferences and system settings

## 🎨 Features Overview

### Advanced Search Filters

- **College Affiliation**: Filter properties by TAU college proximity
- **Distance**: Find properties within specific distance ranges
- **Categories**: Student-friendly, female-only, male-only, budget, private, family
- **Price Range**: Customizable minimum and maximum monthly rent
- **Room Types**: Solo, shared, bed spacer
- **Amenities**: WiFi, laundry, parking, etc.
- **Rules & Preferences**: Female-only, male-only, pets allowed, smoking allowed, etc.
- **Advanced Features**: 24/7 security, CCTV, fire safety, near transport, study-friendly, quiet environment, flexible lease

### Interactive Map

- Real-time map visualization
- Dynamic center based on college selection
- Distance calculations from campus
- Property markers with details

### Listing Details

- Multiple high-resolution photos
- Detailed property information
- Amenity icons
- Rating and review system
- Availability calendar
- Price breakdown
- Room types and bed details

## 📊 System Architecture

### Frontend Structure

```
app/
├── (auth)/             # Authentication pages
├── admin/             # Admin dashboard
├── landlord/          # Landlord dashboard
├── listings/          # Property listing pages
├── properties/        # Property management pages
├── reservations/      # Booking management pages
├── favorites/         # Saved properties
├── legal/             # Legal pages (terms, privacy, accessibility, help)
├── layout.tsx         # Root layout
└── page.tsx           # Home page
```

### Backend Structure

```
app/api/
├── auth/              # Authentication endpoints
├── listings/          # Property listing endpoints
├── inquiries/         # Inquiry management endpoints
├── landlord/          # Landlord dashboard endpoints
├── admin/             # Admin dashboard endpoints
├── webhooks/          # Stripe webhooks
└── edgestore/         # File storage endpoints
```

### Database Models

- **User**: Tenant, Landlord, Administrator accounts
- **Listing**: Property details, amenities, rules, pricing
- **Reservation**: Booking information, dates, status
- **Inquiry**: Tenant inquiries to property owners
- **Review**: User reviews and ratings
- **Image**: Property photos and media

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **OTP Verification**: Email verification for new accounts
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: API endpoint protection
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Anti-cross-site request forgery measures

## 📈 Performance Optimization

- **Server-Side Rendering (SSR)**: Fast initial page loads
- **Static Site Generation (SSG)**: Pre-built static pages
- **Image Optimization**: Next.js image component
- **Dynamic Imports**: Lazy loading for heavy components
- **API Caching**: Response caching for frequent requests
- **Code Splitting**: Optimized bundle sizes

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push code to GitHub**: `git push origin main`
2. **Import repository on Vercel**: Connect your GitHub repository
3. **Configure environment variables**: Add all required environment variables
4. **Deploy**: Vercel will automatically build and deploy your project

### Traditional Deployment

1. **Build the application**: `npm run build`
2. **Start the server**: `npm start`
3. **Configure reverse proxy**: Use Nginx or Apache to serve the application
4. **Set up environment variables**: Ensure all variables are correctly configured

## 🤝 Contributing

### Getting Started

1. **Create a branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Implement your feature or bug fix
3. **Test**: Test your changes thoroughly
4. **Commit**: `git add . && git commit -m "Description of changes"`
5. **Push**: `git push origin feature/your-feature`
6. **PR**: Create a Pull Request on GitHub

### Contribution Guidelines

- Follow the existing code style
- Write clear, concise commit messages
- Test your changes
- Update documentation if needed
- Be respectful in PR reviews

## 📞 Support

If you encounter any issues or have questions:

1. **Check the FAQ**: Visit `/legal/help` for frequently asked questions
2. **Contact Support**: Email support@boardtau.com
3. **Report Bugs**: Create an issue on GitHub

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the TAU community**

[BoardTAU Website](https://boardtau.com) | [GitHub Repository](https://github.com/danbalaba/board-tau)
