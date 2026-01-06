interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="login-shell">
      <div
        className="login-left"
        role="img"
        aria-label="Students studying together"
      />
      <div className="login-right">
        <div className="login-right-inner">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo.webp" alt="Callback Console logo" />
            <h1 className="login-title">Callback requests, organized in one place.</h1>
            <p className="login-subtitle">
              Track open calls, assignments, and notes from a single dashboard.
              Sign in with Microsoft to continue.
            </p>
          </div>

          <div className="login-card">
            <div>
              <h2 className="login-card-title">Sign in</h2>
              <p className="login-card-subtitle">
                Use your Microsoft account to access the dashboard.
              </p>
            </div>
            <button className="login-button" onClick={onLogin}>
              <span className="login-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation">
                  <rect x="2" y="2" width="9" height="9" rx="1.2" />
                  <rect x="13" y="2" width="9" height="9" rx="1.2" />
                  <rect x="2" y="13" width="9" height="9" rx="1.2" />
                  <rect x="13" y="13" width="9" height="9" rx="1.2" />
                </svg>
              </span>
              Continue with Microsoft
            </button>
            <p className="login-note">You will be redirected to Microsoft to sign in.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
