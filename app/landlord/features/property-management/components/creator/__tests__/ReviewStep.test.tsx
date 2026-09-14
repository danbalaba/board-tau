import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewStep from '../ReviewStep';
import { useForm } from 'react-hook-form';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('@/lib/landlordTaxonomyCache', () => ({
  getSyncAttributes: () => [
    { id: 'WiFi|Wifi', name: 'WiFi', type: 'PROPERTY_AMENITY' },
    { id: 'No Smoking|Wind', name: 'No Smoking', type: 'RULE', subGroupKey: 'SMOKING_POLICY' },
    { id: 'CCTV|Camera', name: 'CCTV', type: 'FEATURE', subGroupKey: 'SECURITY' }
  ],
  getCachedAttributes: jest.fn().mockResolvedValue([
    { id: 'WiFi|Wifi', name: 'WiFi', type: 'PROPERTY_AMENITY' },
    { id: 'No Smoking|Wind', name: 'No Smoking', type: 'RULE', subGroupKey: 'SMOKING_POLICY' },
    { id: 'CCTV|Camera', name: 'CCTV', type: 'FEATURE', subGroupKey: 'SECURITY' }
  ]),
  getSyncSubGroups: () => [{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }],
  getCachedSubGroups: jest.fn().mockResolvedValue([{ key: 'KITCHEN_APP', type: 'AMENITY', title: 'Shared Kitchen' }]),
  getSyncPropertyTypes: () => [{ id: '1', name: 'Boarding House' }],
  getCachedPropertyTypes: jest.fn().mockResolvedValue([{ id: '1', name: 'Boarding House' }]),
  getSyncRoomTypes: () => [{ value: 'SOLO', label: 'Solo Room' }],
  getCachedRoomTypes: jest.fn().mockResolvedValue([{ value: 'SOLO', label: 'Solo Room' }]),
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
    expect(screen.getByText(/Final Property Application Review/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Basic Info/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Location/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Setup & Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Rooms & Rates/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Photos/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Documents/i)).toBeInTheDocument();
  });

  it('displays form data correctly', () => {
    render(<Wrapper />);
    expect(screen.getByText('Test Business')).toBeInTheDocument();
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/2\. Location/i));
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
  });

  it('renders amenities, rules, and features', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText(/3\. Setup & Rules/i));
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('No Smoking')).toBeInTheDocument();
    expect(screen.getByText('CCTV')).toBeInTheDocument();
  });
});
