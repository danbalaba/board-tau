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

jest.mock('lucide-react', () => ({
  ShieldCheck: () => <div />,
  Info: () => <div />,
}));

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
    expect(screen.getByText('Legal Check')).toBeInTheDocument();
    
    expect(screen.getByTestId('file-upload-Government ID')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-Business Permit')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-Land Title / Lease Agreement')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-Barangay Clearance')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-Fire Safety Certificate')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<Wrapper />);
    const selectBtn = screen.getByTestId('file-upload-Government ID').querySelector('button');
    if (selectBtn) {
      fireEvent.click(selectBtn);
    }
  });

  it('handles preview', () => {
    render(<Wrapper />);
    
    // We didn't set a URL in watch in this simple wrapper, so preview might not open,
    // but the button click handler should not crash.
    const previewBtn = screen.getByTestId('file-upload-Government ID').querySelectorAll('button')[1];
    fireEvent.click(previewBtn);
  });
});
