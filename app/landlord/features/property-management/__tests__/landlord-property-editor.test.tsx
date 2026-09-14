import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandlordPropertyEditor from '../landlord-property-editor';

jest.mock('@/lib/edgestore', () => ({
  useEdgeStore: () => ({
    edgestore: {
      publicFiles: {
        upload: jest.fn().mockResolvedValue({ url: 'test-url' })
      }
    }
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

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
jest.mock('../components/creator/PropertyBasicStep', () => () => <div data-testid="basics-step">Basics Step</div>);
jest.mock('../components/landlord-location-step', () => () => <div data-testid="location-step">Location Step</div>);
jest.mock('../components/creator/PropertyConfigStep', () => () => <div data-testid="config-step">Config Step</div>);
jest.mock('../components/creator/RoomConfigStep', () => () => <div data-testid="rooms-step">Rooms Step</div>);
jest.mock('../components/creator/PropertyImagesStep', () => () => <div data-testid="images-step">Images Step</div>);
jest.mock('../components/creator/DocumentsStep', () => () => <div data-testid="docs-step">Docs Step</div>);

// Mock modals
jest.mock('@/components/modals/Modal', () => ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null);
jest.mock('../components/creator/BulkConfigureModal', () => () => <div data-testid="bulk-modal">Bulk Modal</div>);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

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

describe('LandlordPropertyEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basics step by default in edit mode', () => {
    render(<LandlordPropertyEditor initialData={{ id: '1' }} />);
    
    expect(screen.getByTestId('basics-step')).toBeInTheDocument();
  });

  it('renders header with edit title', () => {
    render(<LandlordPropertyEditor initialData={{ id: '1' }} />);
    
    expect(screen.getByText('Edit Property Details')).toBeInTheDocument();
  });
});
