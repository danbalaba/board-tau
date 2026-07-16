import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HostApplicationModal from '../HostApplicationModal';
import { useHostApplicationLogic } from '../../host-application/useHostApplicationLogic';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, layoutId, layout, ...props }: any, ref: any) => {
        return <div ref={ref} {...props}>{children}</div>;
      }),
      button: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, layoutId, layout, ...props }: any, ref: any) => {
        return <button ref={ref} {...props}>{children}</button>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('../../host-application/useHostApplicationLogic', () => ({
  useHostApplicationLogic: jest.fn(),
}));

jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  const Modal = ({ children, onClose, title }: any) => (
    <div data-testid="mock-modal">
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      {title && <div data-testid="modal-title">{title}</div>}
      {children}
    </div>
  );
  return Modal;
});

// Mock dynamic imports
jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent() {
    return <div data-testid="mock-dynamic-component" />;
  };
});

jest.mock('@/components/common/Button', () => {
  const React = require('react');
  return function MockButton({ children, onClick, disabled }: any) {
    return <button onClick={onClick} disabled={disabled} data-testid="mock-button">{children}</button>;
  };
});

// Mock Steps
jest.mock('../../host-application/steps/WelcomeStep', () => () => <div data-testid="step-welcome" />);
jest.mock('../../host-application/steps/LandlordInfoStep', () => () => <div data-testid="step-landlord-info" />);
jest.mock('../../host-application/steps/PropertyEvidenceStep', () => () => <div data-testid="step-property" />);
jest.mock('../../host-application/steps/LegalDocumentsStep', () => () => <div data-testid="step-legal" />);
jest.mock('../../host-application/steps/PrepareStep', () => () => <div data-testid="step-prepare" />);
jest.mock('../../host-application/steps/ReviewStep', () => () => <div data-testid="step-review" />);

describe('HostApplicationModal Component', () => {
  const mockOnClose = jest.fn();

  const baseLogic = {
    step: 0,
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    handleSubmit: jest.fn(),
    submitted: false,
    isLoadingStep: false,
    isSubmitting: false,
    register: jest.fn(),
    errors: {},
    watch: jest.fn(),
    control: {},
    setValue: jest.fn(),
    facadeFile: null,
    setFacadeFile: jest.fn(),
    permitFile: null,
    setPermitFile: jest.fn(),
    fireSafetyFile: null,
    setFireSafetyFile: jest.fn(),
    hasReadGuidelines: false,
    setHasReadGuidelines: jest.fn(),
    capturedSelfie: null,
    setCapturedSelfie: jest.fn(),
    webcamRef: { current: null },
    facingMode: 'user',
    setFacingMode: jest.fn(),
    isFaceAligned: false,
    setIsFaceAligned: jest.fn(),
    hasUserBlinked: false,
    isProcessing: false,
    isFlashActive: false,
    handleCaptureSelfie: jest.fn(),
    capturedID: null,
    setCapturedID: jest.fn(),
    isIDAligned: false,
    setIsIDAligned: jest.fn(),
    handleCaptureID: jest.fn(),
    isPhoneDetected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders WelcomeStep at step 0', () => {
    (useHostApplicationLogic as jest.Mock).mockReturnValue(baseLogic);

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('step-welcome')).toBeInTheDocument();
    expect(screen.getAllByText('Welcome').length).toBeGreaterThan(0);
  });

  it('renders LandlordInfoStep at step 1', () => {
    (useHostApplicationLogic as jest.Mock).mockReturnValue({ ...baseLogic, step: 1 });

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('step-landlord-info')).toBeInTheDocument();
    expect(screen.getAllByText('Identity').length).toBeGreaterThan(0);
  });

  it('calls prevStep and nextStep on button clicks', () => {
    const nextStepMock = jest.fn();
    const prevStepMock = jest.fn();
    (useHostApplicationLogic as jest.Mock).mockReturnValue({
      ...baseLogic,
      step: 1, // Step > 0 to show footer buttons
      nextStep: nextStepMock,
      prevStep: prevStepMock,
    });

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    // In step 1, "Back" and "Continue" buttons are shown
    const backBtn = screen.getByText('Back').closest('button');
    const continueBtn = screen.getByText('Continue').closest('button');

    fireEvent.click(backBtn!);
    expect(prevStepMock).toHaveBeenCalledTimes(1);

    fireEvent.click(continueBtn!);
    expect(nextStepMock).toHaveBeenCalledTimes(1);
  });

  it('shows submitting state and calls handleSubmit at the last step', () => {
    const handleSubmitMock = jest.fn();
    (useHostApplicationLogic as jest.Mock).mockReturnValue({
      ...baseLogic,
      step: 7, // Last step (Review)
      handleSubmit: handleSubmitMock,
    });

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    const submitBtn = screen.getByText('Submit Application').closest('button');
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn!);
    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('shows success screen when submitted is true', () => {
    (useHostApplicationLogic as jest.Mock).mockReturnValue({
      ...baseLogic,
      submitted: true,
    });

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Application Submitted')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to Dashboard')).toBeInTheDocument();
  });

  it('shows loading state when isLoadingStep is true', () => {
    (useHostApplicationLogic as jest.Mock).mockReturnValue({
      ...baseLogic,
      isLoadingStep: true,
    });

    render(<HostApplicationModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
