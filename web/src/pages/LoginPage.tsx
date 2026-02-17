import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.2 14.6 2.3 12 2.3A9.7 9.7 0 0 0 2.3 12 9.7 9.7 0 0 0 12 21.7c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#34A853" d="M2.3 12c0 3.8 2.2 7.1 5.3 8.7l3-2.5c-.8-.2-4.3-1.3-4.3-6.2 0-.3 0-.6.1-.9l-3.1-2.6A9.6 9.6 0 0 0 2.3 12z" />
      <path fill="#4285F4" d="M12 21.7c2.6 0 4.8-.8 6.4-2.3l-3.1-2.5c-.8.6-1.9 1-3.3 1-2.5 0-4.7-1.7-5.4-4.1l-3 2.3A9.7 9.7 0 0 0 12 21.7z" />
      <path fill="#FBBC05" d="M6.6 13.8A5.9 5.9 0 0 1 6 12c0-.6.1-1.2.3-1.8l-3-2.4A9.7 9.7 0 0 0 2.3 12c0 1.5.4 2.9 1.1 4.1l3.2-2.3z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 .5 12.2c0 5.2 3.3 9.6 7.9 11.2.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1.1.1-.8.4-1.4.8-1.8-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.2.8 2.4v3.6c0 .4.2.7.8.6a11.7 11.7 0 0 0 7.9-11.2A11.5 11.5 0 0 0 12 .5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, isLoading, signInWithOAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<'google' | 'github' | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="loading-with-spinner">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from || '/'} replace />;
  }

  const from = (location.state as { from?: string } | null)?.from;
  if (!from) {
    return <Navigate to="/" replace />;
  }

  const startOAuth = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      setPendingProvider(provider);
      window.sessionStorage.removeItem('guestMode');
      await signInWithOAuth(provider);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your Supabase auth provider settings and try again.');
      setPendingProvider(null);
    }
  };

  const handleContinueAsGuest = () => {
    window.sessionStorage.setItem('guestMode', 'true');
    navigate(from || '/', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Scalendar</h1>
        <p className="login-subtitle">Sign in to sync your teams and settings across devices.</p>

        <button
          className="oauth-btn oauth-google"
          onClick={() => startOAuth('google')}
          disabled={pendingProvider !== null}
        >
          <span className="oauth-icon" aria-hidden="true"><GoogleLogo /></span>
          <span>{pendingProvider === 'google' ? 'Redirecting...' : 'Continue with Google'}</span>
        </button>

        <button
          className="oauth-btn oauth-github"
          onClick={() => startOAuth('github')}
          disabled={pendingProvider !== null}
        >
          <span className="oauth-icon" aria-hidden="true"><GitHubLogo /></span>
          <span>{pendingProvider === 'github' ? 'Redirecting...' : 'Continue with GitHub'}</span>
        </button>

        <div className="guest-slot">
          <button
            className="guest-link-btn"
            onClick={handleContinueAsGuest}
            disabled={pendingProvider !== null}
          >
            Continue as guest
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
