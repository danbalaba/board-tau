import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LandlordInquirySearch } from '../landlord-inquiry-search';

jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: jest.fn((val) => val)
}));

jest.mock('@/components/common/SafeImage', () => {
  return {
    __esModule: true,
    default: function MockSafeImage({ alt }: any) {
      return <img alt={alt} data-testid="safe-image" />;
    }
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, variants, ...rest } = props;
        return <div ref={ref} {...rest}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@tabler/icons-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

const mockInquiries: any[] = [
  {
    id: '1',
    user: { name: 'John Doe', email: 'john@example.com' },
    listing: { title: 'Sunny Apartment', imageSrc: '/img1.jpg' },
    status: 'PENDING'
  },
  {
    id: '2',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    listing: { title: 'Cozy Room', imageSrc: null },
    status: 'APPROVED'
  }
];

describe('LandlordInquirySearch', () => {
  const mockSetSearchQuery = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input correctly', () => {
    render(<LandlordInquirySearch searchQuery="" setSearchQuery={mockSetSearchQuery} inquiries={mockInquiries} />);
    expect(screen.getByPlaceholderText('Search tenant or property...')).toBeInTheDocument();
  });

  it('updates local query and calls setSearchQuery', () => {
    render(<LandlordInquirySearch searchQuery="" setSearchQuery={mockSetSearchQuery} inquiries={mockInquiries} />);
    const input = screen.getByPlaceholderText('Search tenant or property...');
    
    fireEvent.change(input, { target: { value: 'John' } });
    
    expect(input).toHaveValue('John');
    expect(mockSetSearchQuery).toHaveBeenCalledWith('John');
  });

  it('shows clear button when there is a query and clears on click', () => {
    const mockSetSearchQuery = jest.fn();
    render(<LandlordInquirySearch searchQuery="John" setSearchQuery={mockSetSearchQuery} inquiries={mockInquiries} />);
    
    const clearBtn = screen.getByTestId('icon-iconx').parentElement;
    expect(clearBtn).toBeInTheDocument();
    
    fireEvent.click(clearBtn!);
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });

  it('shows suggestions on focus if query matches', () => {
    render(<LandlordInquirySearch searchQuery="John" setSearchQuery={mockSetSearchQuery} inquiries={mockInquiries} />);
    
    const input = screen.getByPlaceholderText('Search tenant or property...');
    fireEvent.focus(input);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sunny Apartment • PENDING')).toBeInTheDocument();
  });

  it('sets query to suggestion user name when clicked', () => {
    render(<LandlordInquirySearch searchQuery="Jane" setSearchQuery={mockSetSearchQuery} inquiries={mockInquiries} />);
    
    const input = screen.getByPlaceholderText('Search tenant or property...');
    fireEvent.focus(input);
    
    const suggestion = screen.getByText('Jane Smith');
    fireEvent.click(suggestion);
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('Jane Smith');
  });
});
