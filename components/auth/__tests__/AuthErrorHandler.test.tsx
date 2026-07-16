import React from 'react';
import { render } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AuthErrorHandler from '../AuthErrorHandler';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

describe('AuthErrorHandler', () => {
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    // Suppress console.log for neat test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
  });

  const setupTest = (errorParam: string | null, callbackUrl: string | null = null) => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => {
        if (param === 'error') return errorParam;
        if (param === 'callbackUrl') return callbackUrl;
        return null;
      }
    });
    render(<AuthErrorHandler />);
  };

  it('does nothing if no error is present', () => {
    setupTest(null);
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does nothing if error is empty or whitespace', () => {
    setupTest('   ');
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('handles OAuthAccountNotLinked error', () => {
    setupTest('OAuthAccountNotLinked');
    expect(toast.error).toHaveBeenCalledWith('An account with this email already exists. Please log in using your existing account type or use a different email.');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('handles CredentialsSignin error', () => {
    setupTest('CredentialsSignin');
    expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('handles OAuthCreateAccount error', () => {
    setupTest('OAuthCreateAccount');
    expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('handles OAuthCallback error', () => {
    setupTest('OAuthCallback');
    expect(toast.error).toHaveBeenCalledWith('Failed to complete sign in. Please try again.');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('ignores Callback error silently', () => {
    setupTest('Callback');
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('handles unknown errors generically', () => {
    setupTest('SomeOtherError');
    expect(toast.error).toHaveBeenCalledWith('Authentication error: SomeOtherError');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('redirects to callbackUrl if provided', () => {
    setupTest('CredentialsSignin', '/dashboard');
    expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('renders nothing', () => {
    const { container } = render(<AuthErrorHandler />);
    expect(container.firstChild).toBeNull();
  });
});
