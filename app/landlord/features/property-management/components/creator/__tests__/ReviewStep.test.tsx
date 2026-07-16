import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewStep from '../ReviewStep';
import { useForm } from 'react-hook-form';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  default: () => <div />,
  Building2: () => <div />,
  BadgeCheck: () => <div />,
  MapPin: () => <div />,
  ShieldCheck: () => <div />,
  Users: () => <div />,
  Shield: () => <div />,
  BookOpen: () => <div />,
  Images: () => <div />,
  FileCheck: () => <div />,
  Info: () => <div />,
  ChevronLeft: () => <div />,
  CheckCircle2: () => <div />,
  Gem: () => <div />,
  Wifi: () => <div />,
  Wind: () => <div />,
  Utensils: () => <div />,
  Shirt: () => <div />,
  Car: () => <div />,
  Dumbbell: () => <div />,
  Tv: () => <div />,
  Waves: () => <div />,
  Landmark: () => <div />,
  Droplets: () => <div />,
  Zap: () => <div />,
  Sparkles: () => <div />,
  Tag: () => <div />,
  Dog: () => <div />,
  Camera: () => <div />,
  Flame: () => <div />,
  Bus: () => <div />,
  Book: () => <div />,
  Calendar: () => <div />,
  HelpCircle: () => <div />,
  Lock: () => <div />,
  Focus: () => <div />,
}));

jest.mock('@/components/common/MediaPreviewOverlay', () => () => <div data-testid="media-preview" />);
jest.mock('@/components/common/SafeImage', () => ({ src }: any) => <img src={src} data-testid="safe-image" />);

const Wrapper = () => {
  const { watch, control } = useForm({
    defaultValues: {
      businessInfo: { businessName: 'Test Business' },
      propertyInfo: { propertyName: 'Test Property', price: '5000' },
      location: { address: '123 Test St', city: 'Test City' },
      propertyConfig: {
        totalRooms: '1',
        bathroomCount: '1',
        rooms: [{ roomType: 'SOLO', capacity: '1', price: '5000', bedCount: '1', bedType: 'SINGLE' }],
        amenities: ['WiFi|Wifi'],
        rules: ['No Smoking|Wind'],
        features: ['CCTV|Camera']
      },
      propertyImages: { property: {}, rooms: {} },
      documents: { governmentId: 'test-url' }
    }
  });

  return (
    <ReviewStep
      watch={watch}
      control={control}
      onBack={jest.fn()}
    />
  );
};

describe('ReviewStep', () => {
  it('renders all sections', () => {
    render(<Wrapper />);
    expect(screen.getByText('Application Review')).toBeInTheDocument();
    expect(screen.getByText('Business Identity')).toBeInTheDocument();
    expect(screen.getByText('Property Essentials')).toBeInTheDocument();
    expect(screen.getByText('Mapping Details')).toBeInTheDocument();
    expect(screen.getByText('Listing Capacity')).toBeInTheDocument();
    expect(screen.getByText('Rules & Preferences')).toBeInTheDocument();
    expect(screen.getByText('Security & Features')).toBeInTheDocument();
    expect(screen.getByText('Room Details & Layout')).toBeInTheDocument();
    expect(screen.getByText('Photo Review')).toBeInTheDocument();
    expect(screen.getByText('Legal Documents')).toBeInTheDocument();
  });

  it('displays form data correctly', () => {
    render(<Wrapper />);
    expect(screen.getByText('Test Business')).toBeInTheDocument();
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
  });

  it('renders amenities, rules, and features', () => {
    render(<Wrapper />);
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('No Smoking')).toBeInTheDocument();
    expect(screen.getByText('CCTV')).toBeInTheDocument();
  });
});
