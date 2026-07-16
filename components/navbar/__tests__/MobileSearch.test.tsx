import React from 'react';
import { render, screen } from '@testing-library/react';
import MobileSearch from '../MobileSearch';

// Mock SearchModal (dynamic import)
jest.mock('@/components/modals/SearchModal', () => {
  return function MockSearchModal() {
    return <div data-testid="search-modal">SearchModal Content</div>;
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, layoutId, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  Dummy.displayName = 'MotionDummy';
  
  const ButtonDummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, layoutId, ...rest } = props;
    return <button ref={ref} {...rest} />;
  });
  
  return {
    motion: {
      div: Dummy,
      button: ButtonDummy,
    },
  };
});

// Mock Modal Component Suite
jest.mock('@/components/modals/Modal', () => {
  const React = require('react');
  
  const MockModal = ({ children }: any) => {
    return <div data-testid="modal-provider">{children}</div>;
  };
  
  MockModal.Trigger = ({ children, name }: any) => (
    <div data-testid={`modal-trigger-${name}`} onClick={() => {}}>
      {children}
    </div>
  );
  
  MockModal.Window = ({ children, name }: any) => (
    <div data-testid={`modal-window-${name}`}>
      {children}
    </div>
  );
  
  return {
    __esModule: true,
    default: MockModal,
    ModalContext: React.createContext({ open: jest.fn(), close: jest.fn(), openName: '' }),
  };
});

describe('MobileSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { act } = require('@testing-library/react');
    await act(async () => {
      render(<MobileSearch />);
    });
    
    expect(screen.getByText('Near TAU')).toBeInTheDocument();
    
    // Check if modal components are present
    expect(screen.getByTestId('modal-trigger-search')).toBeInTheDocument();
    expect(screen.getByTestId('modal-window-search')).toBeInTheDocument();
  });
});
