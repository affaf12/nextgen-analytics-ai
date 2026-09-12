export default function LoginHero({ onLogin, loading }) {
  return (
    <div className="login-hero">
      <div className="hero-card">
        <div className="hero-badge">nextgen-analytics-ai · Free multi-model access</div>
        <h1 className="hero-title">Upload a broken file.<br />Get back a fixed one.</h1>
        <p className="hero-sub">
          Sign in once to unlock free access to every model below — no API keys,
          no cost to you. Attach a file (or a whole project as a .zip), tell it
          what to fix, and download the corrected version.
        </p>
        <div className="hero-grid">
          <div className="hero-feature">
            <div className="hero-feature-title">Any file type</div>
            <div className="hero-feature-sub">Code, text, or a full project .zip</div>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-title">5 free models</div>
            <div className="hero-feature-sub">Switch anytime, same account</div>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-title">Direct download</div>
            <div className="hero-feature-sub">Per file, or all at once as .zip</div>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-title">No API keys</div>
            <div className="hero-feature-sub">Sign in and start fixing files</div>
          </div>
        </div>
        <button className="btn-login" onClick={onLogin} disabled={loading}>
          {loading ? 'Connecting…' : 'Sign in to start'}
        </button>
      </div>
    </div>
  )
}
