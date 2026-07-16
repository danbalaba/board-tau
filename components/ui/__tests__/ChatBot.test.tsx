import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from '../ChatBot';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';

jest.mock('@/components/modals/AuthModal', () => () => <div data-testid="auth-modal" />);

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, animate, initial, exit, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      button: React.forwardRef(({ children, whileHover, whileTap, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
  }
});

// Mock react-markdown
jest.mock('react-markdown', () => ({ children }: any) => <div>{children}</div>);
jest.mock('remark-gfm', () => () => {}, { virtual: true });

describe('ChatBot', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reply: 'Hello from AI' })
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders chatbot button initially', () => {
    render(
      <SessionProvider session={null}>
        <ChatBot />
      </SessionProvider>
    );
    const toggleBtn = screen.getByAltText('Chat').closest('button') as HTMLElement;
    expect(toggleBtn).toBeInTheDocument();
  });

  it('opens chat window when button is clicked', () => {
    render(
      <SessionProvider session={null}>
        <ChatBot />
      </SessionProvider>
    );
    const toggleBtn = screen.getByAltText('Chat').closest('button') as HTMLElement;
    fireEvent.click(toggleBtn);
    
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
  });

  it('sends a message and receives response', async () => {
    render(
      <SessionProvider session={null}>
        <ChatBot />
      </SessionProvider>
    );
    
    const toggleBtn = screen.getByAltText('Chat').closest('button') as HTMLElement;
    fireEvent.click(toggleBtn); // open chat
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Hi there' } });
    
    fireEvent.submit(input.closest('form')!);
    
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    
    await waitFor(() => {
      // Fixed the intentional error for the final green screenshot!
      expect(screen.getByText('Hello from AI')).toBeInTheDocument();
    });
  });
});
