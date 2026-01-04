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
            <h1 className="login-title">Callback requests, organized in one place.</h1>
            <p className="login-subtitle">
              Track open calls, assignments, and notes from a single dashboard.
              Use the test login while Microsoft sign-in is being finalized.
            </p>
          </div>

          <div className="login-card">
            <div>
              <h2 className="login-card-title">Sign in</h2>
              <p className="login-card-subtitle">
                Continue with the test user to access the dashboard.
              </p>
            </div>
            <button className="login-button" onClick={onLogin}>
              Continue as Test User
            </button>
            <p className="login-note">Microsoft login will be enabled soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
