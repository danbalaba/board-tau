import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LandlordPropertyCreator } from '../landlord-property-creator';

// Mock the hook to simplify testing
jest.mock('../hooks/use-property-creator-logic', () => ({
  usePropertyCreatorLogic: () => ({
    methods: {
      register: jest.fn(),
      control: {},
      watch: jest.fn(),
      formState: { errors: {} },
    },
    register: jest.fn(),
    control: {},
    watch: jest.fn(),
    errors: {},
    fields: [],
    append: jest.fn(),
    remove: jest.fn(),
    getValues: jest.fn(),
    setValue: jest.fn(),
    clearErrors: jest.fn(),
    currentStep: 0,
    setCurrentStep: jest.fn(),
    isSubmitting: false,
    isMounted: true, // Force mounted state for rendering
    uploadedFiles: {},
    propertyFiles: {},
    roomFiles: {},
    handleNext: jest.fn(),
    handleBack: jest.fn(),
    handleLocationSelect: jest.fn(),
    handleAddressAutoFill: jest.fn(),
    handleFileUpload: jest.fn(),
    handlePropertyFilesChange: jest.fn(),
    handleRoomFilesChange: jest.fn(),
    onSubmit: jest.fn((e) => e?.preventDefault()),
  }),
}));

// Mock inner steps to focus on wizard navigation
jest.mock('../components/creator/PropertyBasicStep', () => () => <div data-testid="step-0">Basic Step</div>);
jest.mock('../components/landlord-location-step', () => () => <div data-testid="step-1">Location Step</div>);
jest.mock('../components/creator/PropertyConfigStep', () => () => <div data-testid="step-2">Config Step</div>);
jest.mock('../components/creator/RoomConfigStep', () => () => <div data-testid="step-3">Room Config Step</div>);
jest.mock('../components/creator/PropertyImagesStep', () => () => <div data-testid="step-4">Images Step</div>);
jest.mock('../components/creator/DocumentsStep', () => () => <div data-testid="step-5">Documents Step</div>);
jest.mock('../components/creator/ReviewStep', () => () => <div data-testid="step-6">Review Step</div>);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LandlordPropertyCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wizard header', () => {
    render(<LandlordPropertyCreator />);
    expect(screen.getByText('New Property Listing')).toBeInTheDocument();
    expect(screen.getByText('Discard Draft')).toBeInTheDocument();
  });

  it('renders the first step by default', () => {
    render(<LandlordPropertyCreator />);
    expect(screen.getByTestId('step-0')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<LandlordPropertyCreator />);
    expect(screen.getByText('Next Step')).toBeInTheDocument();
  });
});
