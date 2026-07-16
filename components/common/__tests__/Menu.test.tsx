import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from '../Menu';

// Mock framer-motion to avoid animation delays in tests
jest.mock('framer-motion', () => {
  const original = jest.requireActual('framer-motion');
  return {
    ...original,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      ul: React.forwardRef(({ children, ...props }: any, ref) => (
        <ul ref={ref} {...props}>{children}</ul>
      )),
    },
  };
});

describe('Menu', () => {
  it('renders menu structure correctly', () => {
    render(
      <Menu>
        <Menu.Toggle id="menu-1">
          <button>Open Menu</button>
        </Menu.Toggle>
        <Menu.List>
          <Menu.Button>Item 1</Menu.Button>
        </Menu.List>
      </Menu>
    );
    
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
    // List shouldn't be visible initially
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('toggles menu list visibility when toggle is clicked', () => {
    render(
      <Menu>
        <Menu.Toggle id="menu-1">
          <button>Open Menu</button>
        </Menu.Toggle>
        <Menu.List>
          <Menu.Button>Item 1</Menu.Button>
        </Menu.List>
      </Menu>
    );
    
    const toggleBtn = screen.getByText('Open Menu');
    
    // Open menu
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('closes menu when a menu button is clicked', () => {
    const onClickMock = jest.fn();
    
    render(
      <Menu>
        <Menu.Toggle id="menu-1">
          <button>Open Menu</button>
        </Menu.Toggle>
        <Menu.List>
          <Menu.Button onClick={onClickMock}>Item 1</Menu.Button>
        </Menu.List>
      </Menu>
    );
    
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Item 1'));
    expect(onClickMock).toHaveBeenCalled();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('closes menu when Escape is pressed', () => {
    render(
      <Menu>
        <Menu.Toggle id="menu-1">
          <button>Open Menu</button>
        </Menu.Toggle>
        <Menu.List>
          <Menu.Button>Item 1</Menu.Button>
        </Menu.List>
      </Menu>
    );
    
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    // Note: useOutsideClick relies on ref containment which can be tricky in JSDOM,
    // but typically mousedown on document simulates an outside click
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <Menu>
          <Menu.Toggle id="menu-1">
            <button>Open Menu</button>
          </Menu.Toggle>
          <Menu.List>
            <Menu.Button>Item 1</Menu.Button>
          </Menu.List>
        </Menu>
      </div>
    );
    
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    fireEvent.click(document.body);
    
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('applies correct position classes to List', () => {
    render(
      <Menu>
        <Menu.Toggle id="menu-1">
          <button>Open Menu</button>
        </Menu.Toggle>
        <Menu.List position="bottom-left">
          <Menu.Button>Item 1</Menu.Button>
        </Menu.List>
      </Menu>
    );
    
    fireEvent.click(screen.getByText('Open Menu'));
    
    const list = screen.getByRole('list'); // motion.ul
    expect(list.className).toContain('left-0');
    expect(list.className).not.toContain('right-0');
  });
});
