import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveCard } from '../interactive-card';

// Mock framer-motion to simplify testing
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    useMotionValue: () => ({ set: jest.fn(), get: jest.fn() }),
    useTransform: () => ({}),
    useMotionTemplate: () => '',
  };
});

describe('InteractiveCard', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
  });

  it('renders children correctly', () => {
    render(
      <InteractiveCard>
        <div data-testid="child">Test Content</div>
      </InteractiveCard>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles pointer events without crashing', () => {
    const { container } = render(
      <InteractiveCard>
        <div>Test</div>
      </InteractiveCard>
    );
    
    // Find the outer motion.div
    const card = container.firstChild as HTMLElement;
    
    // Trigger pointer events
    fireEvent.pointerEnter(card);
    fireEvent.pointerMove(card, { clientX: 50, clientY: 50 });
    fireEvent.pointerLeave(card);
    
    // Component should still be rendered
    expect(card).toBeInTheDocument();
  });
});
