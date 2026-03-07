import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  // Test 1: Component renders with text
  it('renders with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  // Test 2: Handles click events
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 3: Disabled state works
  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // Test 4: Size variants
  it('renders large button correctly', () => {
    render(<Button size="large">Large Button</Button>);
    expect(screen.getByText('Large Button')).toBeInTheDocument();
  });

  // Test 5: Variant styles
  it('renders danger variant correctly', () => {
    render(<Button variant="danger">Danger Button</Button>);
    expect(screen.getByText('Danger Button')).toBeInTheDocument();
  });

  // Test 6: Outline style
  it('renders outline button correctly', () => {
    render(<Button outline>Outline Button</Button>);
    expect(screen.getByText('Outline Button')).toBeInTheDocument();
  });
});
