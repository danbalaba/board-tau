import {
  IconMail,
  IconCalendarCheck,
  IconStar,
  IconCreditCard,
} from '@tabler/icons-react';

export const recentActivities = [
  {
    id: 1,
    type: 'INQUIRY',
    title: 'New Inquiry Received',
    description: 'for Apartment #3 - Luxury Studio',
    time: '2 hours ago',
    status: 'Pending',
    icon: IconMail,
    color: 'amber',
    href: '/landlord/inquiries'
  },
  {
    id: 2,
    type: 'BOOKING',
    title: 'Booking Confirmed',
    description: 'James Wilson booked Sunset Villa',
    time: '5 hours ago',
    status: 'Confirmed',
    icon: IconCalendarCheck,
    color: 'emerald',
    href: '/landlord/bookings'
  },
  {
    id: 3,
    type: 'REVIEW',
    title: 'New 5-Star Review',
    description: 'from Sarah Jenkins about Loft #12',
    time: 'Yesterday',
    status: 'Published',
    icon: IconStar,
    color: 'blue',
    href: '/landlord/reviews'
  },
  {
    id: 4,
    type: 'PAYMENT',
    title: 'Payment Received',
    description: '₱12,500 from Unit 4B Monthly Rent',
    time: '2 days ago',
    status: 'Success',
    icon: IconCreditCard,
    color: 'purple',
    href: '/landlord/payments'
  }
];
