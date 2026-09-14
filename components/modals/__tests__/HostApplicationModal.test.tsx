import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HostApplicationModal from '../HostApplicationModal';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', name: 'John Landlord' } } }),
}));

jest.mock('../../host-application/onboarding/HostOnboardingContainer', () => {
  return function MockHostOnboardingContainer({ user, onCloseModal }: any) {
    return (
      <div data-testid="mock-onboarding-container">
        <span>Welcome {user?.name || 'Guest'}</span>
        <button onClick={onCloseModal}>Close Onboarding</button>
      </div>
    );
  };
});

describe('HostApplicationModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders HostOnboardingContainer with user session', () => {
    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('mock-onboarding-container')).toBeInTheDocument();
    expect(screen.getByText('Welcome John Landlord')).toBeInTheDocument();
  });

  it('handles close button trigger', () => {
    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByText('Close Onboarding');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
