import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { Header } from '@/components/layout/Header';
import { DataProvider } from '@/context/DataContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Mock Firebase Auth
const mockSignInWithPopup = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
let authStateListener: ((user: any) => void) | null = null;

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn(),
  })),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    authStateListener = callback;
    // Default to null user initially
    callback(null);
    return () => {
      authStateListener = null;
    };
  }),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

describe('Unified Authentication System (NAYRA & CA Tracker)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const TestConsumer: React.FC = () => {
    const { user, userProfile, signInWithGoogle, signOut } = useAuth();
    return (
      <div>
        <div data-testid="user-status">{user ? 'authenticated' : 'unauthenticated'}</div>
        <div data-testid="user-email">{userProfile?.email || 'none'}</div>
        <button onClick={signInWithGoogle}>Google Login</button>
        <button onClick={signOut}>Logout</button>
      </div>
    );
  };

  it('provides unauthenticated state by default with safe fallback', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('updates state when onAuthStateChanged emits target NAYRA user', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status').textContent).toBe('unauthenticated');

    // Simulate NAYRA primary user auth event wrapped in act
    await waitFor(() => {
      authStateListener?.({
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
        photoURL: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-status').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('aaryanpandey28@gmail.com');
    });
  });

  it('calls signInWithPopup on Google login', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Google Login'));
    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
  });

  it('renders LoginModal with Google and Email auth fields complying with anti-slop guidelines', () => {
    const onClose = vi.fn();
    render(
      <AuthProvider>
        <LoginModal isOpen={true} onClose={onClose} />
      </AuthProvider>
    );

    // Title & anti-slop typography
    expect(screen.getByText(/Sign In to Unified Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/aryanpandey28@gmail.com/i)).toBeInTheDocument();

    // Verify rectangular container (not rounded-full)
    const modalContent = screen.getByRole('dialog').firstElementChild;
    expect(modalContent?.className).toContain('rounded-md');
    expect(modalContent?.className).not.toContain('rounded-full');
  });

  it('handles popup-closed-by-user gracefully without error banner and keeps modal open', async () => {
    mockSignInWithPopup.mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });
    const onClose = vi.fn();

    render(
      <AuthProvider>
        <LoginModal isOpen={true} onClose={onClose} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText(/Continue with Google/i));

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    });

    // Should not close modal and should not display an error
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText(/Failed to authenticate with Google/i)).not.toBeInTheDocument();
  });

  it('surfaces error banner on other Google sign-in failures', async () => {
    mockSignInWithPopup.mockRejectedValueOnce({ code: 'auth/network-request-failed', message: 'Network connection failed' });
    const onClose = vi.fn();

    render(
      <AuthProvider>
        <LoginModal isOpen={true} onClose={onClose} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText(/Continue with Google/i));

    await waitFor(() => {
      expect(screen.getByText(/Network connection failed/i)).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles email login with formatted error on invalid email and wrong password', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });
    const onClose = vi.fn();

    render(
      <AuthProvider>
        <LoginModal isOpen={true} onClose={onClose} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText(/aryanpandey28@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    const form = submitBtn.closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address./i)).toBeInTheDocument();
    });
  });

  it('closes LoginModal on Escape key and backdrop click', () => {
    const onClose = vi.fn();
    render(
      <AuthProvider>
        <LoginModal isOpen={true} onClose={onClose} />
      </AuthProvider>
    );

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Backdrop click
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders UserMenu with Sign In button when unauthenticated and opens LoginModal on click', async () => {
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.className).toContain('rounded-md');
    expect(signInButton.className).not.toContain('rounded-full');

    fireEvent.click(signInButton);

    expect(screen.getByText(/Sign In to Unified Account/i)).toBeInTheDocument();
  });

  it('renders authenticated UserMenu with avatar and unified sync status when signed in', async () => {
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );

    // Trigger auth state wrapped in waitFor
    await waitFor(() => {
      authStateListener?.({
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
        photoURL: 'https://example.com/avatar.jpg',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Aryan Pandey')).toBeInTheDocument();
    });

    // Open dropdown
    fireEvent.click(screen.getByText('Aryan Pandey'));

    expect(screen.getByText(/Synced with NAYRA Unified Cloud/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  it('falls back to user initial when avatar image encounters load error', async () => {
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );

    await waitFor(() => {
      authStateListener?.({
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
        photoURL: 'https://invalid-avatar-url.example.com/broken.png',
      });
    });

    const img = screen.getByRole('img');
    fireEvent.error(img);

    // Image replaced by initial 'A'
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('closes UserMenu dropdown on Escape key', async () => {
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );

    await waitFor(() => {
      authStateListener?.({
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
      });
    });

    // Open dropdown
    fireEvent.click(screen.getByText('Aryan Pandey'));
    expect(screen.getByText(/Synced with NAYRA Unified Cloud/i)).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/Synced with NAYRA Unified Cloud/i)).not.toBeInTheDocument();
  });

  it('triggers signOut when clicking Sign Out in UserMenu', async () => {
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );

    await waitFor(() => {
      authStateListener?.({
        uid: 'yApeiNzo23bPTvpEXHgNIgiTX0y1',
        email: 'aaryanpandey28@gmail.com',
        displayName: 'Aryan Pandey',
      });
    });

    // Open dropdown
    fireEvent.click(screen.getByText('Aryan Pandey'));

    // Click Sign Out
    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders Header with UserMenu integrated', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Header activeTab="dashboard" />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
