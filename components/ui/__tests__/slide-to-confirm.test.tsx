import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SlideToConfirm } from '../slide-to-confirm';

// Mock framer-motion to avoid complex dragging simulation
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, onDragEnd, whileTap, dragConstraints, dragElastic, dragMomentum, ...props }: any, ref: any) => {
        // Find if this is the draggable thumb by checking drag prop
        const isThumb = props.drag !== undefined;
        return (
          <div 
            ref={ref} 
            {...props} 
            data-testid={isThumb ? "draggable-thumb" : "motion-div"}
            onClick={isThumb ? onDragEnd : props.onClick}
          >
            {children}
          </div>
        );
      }),
      span: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <span ref={ref} {...props}>{children}</span>
      )),
    },
    useAnimation: () => ({ start: jest.fn() }),
    useMotionValue: () => ({ get: () => 300, set: jest.fn() }),
    useTransform: () => ({}),
  };
});

describe('SlideToConfirm', () => {
  it('renders with default text', () => {
    const onConfirm = jest.fn();
    render(<SlideToConfirm onConfirm={onConfirm} />);
    
    expect(screen.getByText('Slide to confirm')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('calls onConfirm when thumb is dragged (mocked as click)', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<SlideToConfirm onConfirm={onConfirm} />);
    
    const thumb = screen.getByTestId('draggable-thumb');
    
    await act(async () => {
      fireEvent.click(thumb); // We mocked onDragEnd to fire on click
    });

    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not call onConfirm if disabled', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<SlideToConfirm onConfirm={onConfirm} disabled />);
    
    const thumb = screen.getByTestId('draggable-thumb');
    
    await act(async () => {
      fireEvent.click(thumb);
    });

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
