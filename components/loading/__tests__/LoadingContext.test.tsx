import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LoadingProvider, useLoading } from '../LoadingContext';

const TestComponent = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  return (
    <div>
      <span data-testid="status">{isLoading ? 'Loading' : 'Idle'}</span>
      <button onClick={startLoading}>Start</button>
      <button onClick={stopLoading}>Stop</button>
    </div>
  );
};

const FallbackComponent = () => {
  const { isLoading } = useLoading();
  return <span data-testid="fallback">{isLoading ? 'Loading' : 'Idle'}</span>;
};

describe('LoadingContext', () => {
  it('provides default values without provider', () => {
    // Should suppress console.error for testing missing provider if needed,
    // but in this case useLoading has a fallback.
    render(<FallbackComponent />);
    expect(screen.getByTestId('fallback').textContent).toBe('Idle');
  });

  it('toggles loading state correctly', () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('Idle');

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByTestId('status').textContent).toBe('Loading');

    act(() => {
      screen.getByText('Stop').click();
    });

    expect(screen.getByTestId('status').textContent).toBe('Idle');
  });
});
