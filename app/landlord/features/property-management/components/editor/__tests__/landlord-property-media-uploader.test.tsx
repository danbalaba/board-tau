import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandlordPropertyMediaUploader } from '../landlord-property-media-uploader';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
    label: ({ children, className }: any) => <label className={className}>{children}</label>,
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

jest.mock('react-icons/fa', () => ({
  FaImages: () => <div />,
  FaInfoCircle: () => <div />,
}));

jest.mock('../shared-ui', () => ({
  PropertyFormSection: ({ children, title }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock('@/components/common/SafeImage', () => ({ src, alt }: any) => (
  <img src={src} alt={alt} data-testid="safe-image" />
));

describe('LandlordPropertyMediaUploader', () => {
  const defaultFormData = {
    existingImages: [
      { url: 'img1.jpg', category: 'Bedroom' }
    ],
    propertyFiles: [],
  };

  it('renders correctly', () => {
    render(
      <LandlordPropertyMediaUploader
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        handleImageChange={jest.fn()}
        deleteExistingImage={jest.fn()}
      />
    );
    expect(screen.getByText('Visual Gallery')).toBeInTheDocument();
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
    expect(screen.getByText('Add Photos')).toBeInTheDocument();
  });

  it('calls deleteExistingImage when remove is clicked', () => {
    const deleteExistingImage = jest.fn();
    render(
      <LandlordPropertyMediaUploader
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        handleImageChange={jest.fn()}
        deleteExistingImage={deleteExistingImage}
      />
    );
    
    fireEvent.click(screen.getByText('Remove'));
    expect(deleteExistingImage).toHaveBeenCalledWith('img1.jpg');
  });

  it('calls handleImageChange when file is selected', () => {
    const handleImageChange = jest.fn();
    render(
      <LandlordPropertyMediaUploader
        formData={defaultFormData}
        setFormData={jest.fn()}
        setActiveSection={jest.fn()}
        handleImageChange={handleImageChange}
        deleteExistingImage={jest.fn()}
      />
    );
    
    // The file input is hidden inside the label
    // There are multiple inputs, we mock the input by getting it by type
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File([], 'test.jpg')] } });
    
    expect(handleImageChange).toHaveBeenCalled();
  });
});
