import React from 'react';
import { render, screen } from '@testing-library/react';
import WalkInReviewStep from '../steps/walk-in-review-step';

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="mock-safe-image" />
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef((props: any, ref: any) => {
      const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockListings = [
  {
    id: 'list-1',
    rooms: [
      { id: 'room-1', reservationFee: 1500 }
    ]
  }
];

describe('WalkInReviewStep', () => {
  const mockGetValues = jest.fn((key: string) => {
    if (key === 'listingId') return 'list-1';
    if (key === 'roomId') return 'room-1';
    if (key === 'occupantsCount') return 2;
    if (key === 'moveInDate') return new Date('2023-01-01').toISOString();
    return null;
  });

  const mockProps = {
    getValues: mockGetValues as any,
    capturedSelfie: '/selfie.jpg',
    capturedID: '/id.jpg',
    listings: mockListings
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders review step and calculated price correctly', () => {
    render(<WalkInReviewStep {...mockProps} />);
    expect(screen.getByText('Step 6: Final Summary & Review')).toBeInTheDocument();
    
    // Fee * occupants = 1500 * 2 = 3000
    expect(screen.getByText('₱ 3,000')).toBeInTheDocument();
    expect(screen.getByText(/Calculated as ₱ 1,500 × 2 occupants/)).toBeInTheDocument();
  });

  it('renders images if captured', () => {
    render(<WalkInReviewStep {...mockProps} />);
    const images = screen.getAllByTestId('mock-safe-image');
    expect(images).toHaveLength(2);
  });
});
