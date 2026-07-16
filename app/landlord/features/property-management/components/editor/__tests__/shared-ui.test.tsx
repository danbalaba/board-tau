import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalCheckbox, PropertyFormSection, PropertyEditorHeader } from '../shared-ui';

jest.mock('framer-motion', () => ({
  motion: {
    label: ({ children, className }: any) => <label className={className}>{children}</label>,
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    button: ({ children, className, onClick, disabled }: any) => <button className={className} onClick={onClick} disabled={disabled}>{children}</button>,
    section: ({ children, className, id }: any) => <section id={id} className={className}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true, // Mock useInView to trigger useEffect
}));

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      return () => <div data-testid={`icon-${String(prop)}`} />;
    }
  });
});

describe('shared-ui', () => {
  describe('LocalCheckbox', () => {
    it('renders checkbox correctly', () => {
      render(
        <LocalCheckbox
          id="test-check"
          label="Test Checkbox"
          checked={false}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });

    it('calls onChange when clicked', () => {
      const onChange = jest.fn();
      render(
        <LocalCheckbox
          id="test-check"
          label="Test Checkbox"
          checked={false}
          onChange={onChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox', { hidden: true });
      fireEvent.click(checkbox);
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('PropertyFormSection', () => {
    it('renders section and calls setActiveSection', () => {
      const setActiveSection = jest.fn();
      render(
        <PropertyFormSection
          id="test-section"
          title="Test Title"
          description="Test Description"
          icon={() => <div />}
          setActiveSection={setActiveSection}
        >
          <div>Child Content</div>
        </PropertyFormSection>
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
      expect(setActiveSection).toHaveBeenCalledWith('test-section');
    });
  });

  describe('PropertyEditorHeader', () => {
    it('renders header for editing state', () => {
      render(
        <PropertyEditorHeader
          isSubmitting={false}
          onSubmit={jest.fn()}
          isEditing={true}
        />
      );
      expect(screen.getByText('Refine Listing')).toBeInTheDocument();
      expect(screen.getByText('Push Updates Live')).toBeInTheDocument();
    });

    it('renders header for creating state', () => {
      render(
        <PropertyEditorHeader
          isSubmitting={false}
          onSubmit={jest.fn()}
          isEditing={false}
        />
      );
      expect(screen.getByText('Finalize Listing')).toBeInTheDocument();
      expect(screen.getByText('Launch Listing')).toBeInTheDocument();
    });

    it('disables button when submitting', () => {
      render(
        <PropertyEditorHeader
          isSubmitting={true}
          onSubmit={jest.fn()}
          isEditing={true}
        />
      );
      expect(screen.getByText('Synchronizing...')).toBeInTheDocument();
    });
  });
});
