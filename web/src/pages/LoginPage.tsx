import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { user, isLoading, signInWithOAuth } = useAuth();
  const location = useLocation();
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

  const startOAuth = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      setPendingProvider(provider);
      await signInWithOAuth(provider);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check OAuth provider settings in Supabase and try again.');
      setPendingProvider(null);
    }
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
          <span className="oauth-icon">G</span>
          <span>{pendingProvider === 'google' ? 'Redirecting...' : 'Continue with Google'}</span>
        </button>

        <button
          className="oauth-btn oauth-github"
          onClick={() => startOAuth('github')}
          disabled={pendingProvider !== null}
        >
          <span className="oauth-icon">{'{ }'}</span>
          <span>{pendingProvider === 'github' ? 'Redirecting...' : 'Continue with GitHub'}</span>
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
