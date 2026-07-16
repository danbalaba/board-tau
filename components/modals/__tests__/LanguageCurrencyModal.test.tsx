import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageCurrencyModal from '../LanguageCurrencyModal';

describe('LanguageCurrencyModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LanguageCurrencyModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <LanguageCurrencyModal isOpen={true} onClose={mockOnClose} />
    );

    // Default tab is Language
    expect(screen.getByText('Language and region')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();

    // Check if languages are rendered
    expect(screen.getAllByText('English')[0]).toBeInTheDocument();
    expect(screen.getByText('Tagalog')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <LanguageCurrencyModal isOpen={true} onClose={mockOnClose} />
    );

    // Initial tab: Language
    expect(screen.getByText('United States')).toBeInTheDocument();

    // Switch to Currency
    fireEvent.click(screen.getByText('Currency'));

    // Check if currencies are rendered
    expect(screen.getByText('Philippine peso')).toBeInTheDocument();
    expect(screen.getByText('United States dollar')).toBeInTheDocument();

    // The language "United States" (from region) shouldn't be visible anymore, 
    // although "United States dollar" is visible. We can check for a specific currency.
    expect(screen.getByText('PHP - ₱')).toBeInTheDocument();
    expect(screen.getByText('USD - $')).toBeInTheDocument();
  });

  it('allows selecting a language', () => {
    render(
      <LanguageCurrencyModal isOpen={true} onClose={mockOnClose} />
    );

    // Select Tagalog
    const tagalogBtn = screen.getByText('Tagalog').closest('button');
    expect(tagalogBtn).toBeInTheDocument();
    
    // Initially not selected (no specific styling matching "selected" state, but we can click it to ensure no crash)
    fireEvent.click(tagalogBtn!);
    
    // Check if the styling changes (bg-gray-50)
    expect(tagalogBtn).toHaveClass('bg-gray-50');
  });

  it('allows selecting a currency', () => {
    render(
      <LanguageCurrencyModal isOpen={true} onClose={mockOnClose} initialTab="currency" />
    );

    // Initial selection should be PHP
    const phpBtn = screen.getByText('Philippine peso').closest('button');
    expect(phpBtn).toHaveClass('bg-gray-50');

    // Select USD
    const usdBtn = screen.getByText('United States dollar').closest('button');
    expect(usdBtn).toBeInTheDocument();
    
    fireEvent.click(usdBtn!);
    
    expect(usdBtn).toHaveClass('bg-gray-50');
    expect(phpBtn).not.toHaveClass('bg-gray-50');
  });

  it('calls onClose when close button or backdrop is clicked', () => {
    render(
      <LanguageCurrencyModal isOpen={true} onClose={mockOnClose} />
    );

    // The component uses framer-motion, and the backdrop is the first div with a click handler
    // We can simulate clicking the close button (X icon) inside the header
    // The close button is the only button inside a container that has -ml-2
    const closeBtn = screen.getAllByRole('button').find(b => b.className.includes('-ml-2'));
    
    fireEvent.click(closeBtn!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
