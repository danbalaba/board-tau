import React from 'react';
import { render, screen } from '@testing-library/react';
import { LandlordBookingStatusBadge } from '../landlord-booking-status-badge';

describe('LandlordBookingStatusBadge', () => {
  it('renders checked_in status correctly', () => {
    render(<LandlordBookingStatusBadge status="CHECKED_IN" />);
    expect(screen.getByText('Currently In-house')).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    render(<LandlordBookingStatusBadge status="COMPLETED" />);
    expect(screen.getByText('Stay Completed')).toBeInTheDocument();
  });

  it('renders cancelled status correctly', () => {
    render(<LandlordBookingStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Stay Revoked')).toBeInTheDocument();
  });

  it('renders reserved status correctly', () => {
    render(<LandlordBookingStatusBadge status="RESERVED" />);
    expect(screen.getByText('Securely Reserved')).toBeInTheDocument();
  });

  it('renders unknown status with default styling', () => {
    render(<LandlordBookingStatusBadge status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});
