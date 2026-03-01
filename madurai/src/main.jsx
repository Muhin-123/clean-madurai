import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f9fafb', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: '480px', width: '100%' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Application Error</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The app failed to start. Please check your <code>.env</code> configuration.</p>
            <pre style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.message}
            </pre>
            <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '13px' }}>
              Copy <code>.env.example</code> to <code>.env</code> and fill in your Firebase credentials.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global error handling for early detection
window.onerror = function(msg, url, line, col, error) {
  console.error('Global Error:', msg, 'at', url, ':', line, ':', col, error);
  const debugMsg = document.getElementById('debug-msg');
  if (debugMsg) {
    debugMsg.innerHTML = `
      <div style="padding: 1rem; color: #dc2626; font-family: sans-serif; text-align: left; background: #fee2e2; border-radius: 8px; margin-top: 1rem;">
        <p style="font-weight: 800; margin: 0 0 4px 0;">LAUNCH ERROR</p>
        <p style="font-size: 11px; margin: 0 0 8px 0;">${msg}</p>
        <pre style="font-size: 10px; opacity: 0.7; overflow: auto; max-height: 100px; white-space: pre-wrap;">${error?.stack || ''}</pre>
      </div>
    `;
  }
};

window.onunhandledrejection = function(event) {
  console.error('Unhandled Rejection:', event.reason);
};

console.log('App Initializing...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('App Render Command Sent.');

/*
// Register Service Worker for PWA and Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
*/
