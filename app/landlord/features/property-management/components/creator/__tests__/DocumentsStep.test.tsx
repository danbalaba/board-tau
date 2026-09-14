import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentsStep from '../DocumentsStep';
import { useForm } from 'react-hook-form';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
  },
}));

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});

jest.mock('@/components/common/FileUpload', () => ({ label, onFileSelect, onPreview }: any) => (
  <div data-testid={`file-upload-${label}`}>
    <span>{label}</span>
    <button onClick={() => onFileSelect(new File([''], 'test.png', { type: 'image/png' }))}>Select</button>
    <button onClick={onPreview}>Preview</button>
  </div>
));

jest.mock('@/components/common/MediaPreviewOverlay', () => () => <div data-testid="media-preview" />);

const Wrapper = () => {
  const { register, control, watch, formState: { errors } } = useForm();
  const [uploadedFiles, setUploadedFiles] = React.useState({});
  
  return (
    <DocumentsStep
      register={register}
      control={control}
      watch={watch}
      errors={errors}
      uploadedFiles={uploadedFiles}
      onFileUpload={(type, file) => setUploadedFiles(prev => ({ ...prev, [type]: file }))}
    />
  );
};

describe('DocumentsStep', () => {
  it('renders all document fields', () => {
    render(<Wrapper />);
    expect(screen.getByText('Legal Verification')).toBeInTheDocument();
    
    expect(screen.getByText(/Government ID/)).toBeInTheDocument();
    expect(screen.getByText(/Business Permit/)).toBeInTheDocument();
    expect(screen.getByText(/Land Title/)).toBeInTheDocument();
    expect(screen.getByText(/Barangay Clearance/)).toBeInTheDocument();
    expect(screen.getByText(/Fire Safety Certificate/)).toBeInTheDocument();
  });

  it('renders document status badges', () => {
    render(<Wrapper />);
    const requiredBadges = screen.getAllByText('Required');
    expect(requiredBadges.length).toBeGreaterThan(0);
  });
});
