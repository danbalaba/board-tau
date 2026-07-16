import React from 'react';
import { render } from '@testing-library/react';
import { Toaster } from '../Toast';
import { Toaster as HotToaster } from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: {
    dismiss: jest.fn(),
  },
  Toaster: jest.fn(({ children }) => {
    // Render the custom child with a mock toast to ensure it doesn't crash
    return (
      <div data-testid="mock-hot-toaster">
        {children({ id: '1', visible: true, type: 'success', message: 'Test message', duration: 4000 })}
      </div>
    );
  }),
}));

describe('Toast Component', () => {
  it('renders Toaster which wraps HotToaster', () => {
    const { container } = render(<Toaster />);
    
    expect((HotToaster as jest.Mock).mock.calls[0][0]).toMatchObject(
      {
        position: 'top-right',
        toastOptions: expect.any(Object),
      }
    );
    
    expect(container).not.toBeEmptyDOMElement();
  });
});
