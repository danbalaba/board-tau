import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReservationRequestModal from '../ReservationRequestModal';

// Mock Modal components
jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  const Modal = ({ children }: any) => <div data-testid="mock-modal">{children}</div>;
  Modal.Window = ({ children }: any) => <div data-testid="mock-modal-window">{children}</div>;
  Modal.WindowHeader = ({ title }: any) => <div data-testid="mock-modal-header">{title}</div>;
  Modal.Trigger = ({ children }: any) => <div data-testid="mock-modal-trigger">{children}</div>;
  return Modal;
});

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
}));

// Mock Button
jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, disabled }: any) {
    return <button onClick={onClick} disabled={disabled}>{children}</button>;
  };
});

// Mock SafeImage
jest.mock('@/components/common/SafeImage', () => function MockSafeImage() { return <img data-testid="mock-safe-image" alt="mock" />; });

describe('ReservationRequestModal Component', () => {
  const mockRoom = {
    id: 'room-1',
    name: 'Deluxe Room',
    price: 5000,
    capacity: 2,
    availableSlots: 2,
    images: ['test.jpg'],
    roomType: 'Private',
    status: 'Available'
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = () => {
    return render(
      <ReservationRequestModal 
        listingName="Test Listing"
        room={mockRoom}
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    );
  };

  it('renders step 1 correctly', () => {
    const { container } = renderModal();
    
    expect(screen.getByTestId('mock-modal-header')).toHaveTextContent('Reservation Request');
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('₱ 5,000/month')).toBeInTheDocument();
    
    // Check fields
    expect(container.querySelector('input[name="moveInDate"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="stayDuration"]')).toBeInTheDocument();
  });

  it('handles field changes and moves to step 2', async () => {
    const { container } = renderModal();

    // Fill form using querySelector because labels don't have htmlFor
    fireEvent.change(container.querySelector('input[name="moveInDate"]')!, { target: { value: '2023-12', name: 'moveInDate' } });
    fireEvent.change(container.querySelector('select[name="stayDuration"]')!, { target: { value: 'semester', name: 'stayDuration' } });
    fireEvent.change(container.querySelector('select[name="role"]')!, { target: { value: 'student', name: 'role' } });
    fireEvent.change(container.querySelector('select[name="contactMethod"]')!, { target: { value: 'email', name: 'contactMethod' } });

    // Click Next
    const nextBtn = screen.getByText(/Next/i);
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);

    // Should render step 2
    expect(screen.getByText('Review Your Reservation Request')).toBeInTheDocument();
    
    // Check review fields
    expect(screen.getByText('2023-12')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    
    // Submit
    const submitBtn = screen.getByText('Send Request');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        moveInDate: '2023-12',
        stayDuration: 'semester',
        role: 'student',
        contactMethod: 'email',
        roomId: 'room-1',
        listingName: 'Test Listing'
      }));
    });

    // Should show success state
    await waitFor(() => {
      const heading = container.querySelector('h3.text-2xl');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/Reservation Request Sent/i);
    }, { timeout: 3000 });
  });
});
