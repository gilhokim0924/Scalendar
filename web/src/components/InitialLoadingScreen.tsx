import './InitialLoadingScreen.css';

export default function InitialLoadingScreen() {
  return (
    <div className="initial-loading-screen">
      <div className="initial-loading-card">
        <div className="initial-loading-logo">S</div>
        <h1>Scalendar</h1>
        <div className="loading-with-spinner">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Checking your session...</span>
        </div>
      </div>
    </div>
  );
}
