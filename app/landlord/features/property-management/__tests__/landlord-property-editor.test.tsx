import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordPropertyEditor from '../landlord-property-editor';

// Mock hook
jest.mock('../hooks/use-property-editor-logic', () => ({
  usePropertyEditorLogic: () => ({
    formData: {
      title: 'Test Property',
      description: 'Test description',
      category: 'Apartment',
      latlng: [120, 15],
      amenities: [],
      existingImages: [],
      propertyFiles: [],
      rooms: [{}],
    },
    setFormData: jest.fn(),
    errors: {},
    isSubmitting: false,
    isMounted: true,
    isDirty: true,
    canUndo: true,
    handleUndo: jest.fn(),
    handleReset: jest.fn(),
    saveHistory: jest.fn(),
    activeSection: 'basics',
    setActiveSection: jest.fn(),
    handleImageChange: jest.fn(),
    deleteExistingImage: jest.fn(),
    handleSubmitForm: jest.fn(),
    addRoom: jest.fn(),
    removeRoom: jest.fn(),
    updateRoom: jest.fn(),
  }),
}));

// Mock child components
jest.mock('../components/editor/landlord-property-basics-form', () => ({ LandlordPropertyBasicsForm: () => <div data-testid="basics-form">Basics Form</div> }));
jest.mock('../components/editor/landlord-property-location-form', () => ({ LandlordPropertyLocationForm: () => <div data-testid="location-form">Location Form</div> }));
jest.mock('../components/editor/landlord-property-rules-config', () => ({ LandlordPropertyRulesConfig: () => <div data-testid="rules-config">Rules Config</div> }));
jest.mock('../components/editor/landlord-property-amenities-selector', () => ({ LandlordPropertyAmenitiesSelector: () => <div data-testid="amenities-selector">Amenities Selector</div> }));
jest.mock('../components/editor/landlord-property-media-uploader', () => ({ LandlordPropertyMediaUploader: () => <div data-testid="media-uploader">Media Uploader</div> }));
jest.mock('../components/editor/landlord-property-rooms-editor', () => ({ LandlordPropertyRoomsEditor: () => <div data-testid="rooms-editor">Rooms Editor</div> }));

// Mock modals
jest.mock('@/components/modals/Modal', () => ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null);
jest.mock('../components/creator/CustomRuleModal', () => () => <div data-testid="custom-rule-modal">Custom Rule Modal</div>);
jest.mock('../components/creator/CustomFeatureModal', () => () => <div data-testid="custom-feature-modal">Custom Feature Modal</div>);
jest.mock('../components/creator/CustomSharedAmenityModal', () => () => <div data-testid="custom-shared-modal">Custom Shared Modal</div>);
jest.mock('../components/creator/CustomAmenityModal', () => () => <div data-testid="custom-unit-modal">Custom Unit Modal</div>);
jest.mock('../components/creator/BulkConfigureModal', () => () => <div data-testid="bulk-modal">Bulk Modal</div>);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
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

describe('LandlordPropertyEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sections', () => {
    render(<LandlordPropertyEditor initialData={{}} />);
    
    expect(screen.getByTestId('basics-form')).toBeInTheDocument();
    expect(screen.getByTestId('location-form')).toBeInTheDocument();
    expect(screen.getByTestId('rules-config')).toBeInTheDocument();
    expect(screen.getByTestId('amenities-selector')).toBeInTheDocument();
    expect(screen.getByTestId('media-uploader')).toBeInTheDocument();
    expect(screen.getByTestId('rooms-editor')).toBeInTheDocument();
  });

  it('renders header with save buttons when dirty', () => {
    render(<LandlordPropertyEditor initialData={{}} />);
    
    expect(screen.getByText('Refine Listing')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeInTheDocument();
    expect(screen.getByTitle('Discard all changes')).toBeInTheDocument();
  });
});
