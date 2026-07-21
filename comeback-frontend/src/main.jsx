import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.jsx';
import './index.css';
import { auth } from './lib/firebase.js';

// Global fetch interceptor to catch 401s and silently refresh expired tokens
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let response = await originalFetch.apply(this, args);
  
  if (response.status === 401) {
    if (auth.authStateReady) {
      await auth.authStateReady();
    }
    if (auth.currentUser) {
      try {
        console.log("Token expired. Automatically refreshing in background...");
        const freshToken = await auth.currentUser.getIdToken(true);
        
        let [url, options] = args;
        options = options || {};
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${freshToken}`
        };
        
        // Retry the request seamlessly
        let retryResponse = await originalFetch(url, options);
        if (retryResponse.status === 401) {
          // Unrecoverable, force logout
          await auth.signOut();
          localStorage.clear();
          window.location.href = '/';
          return new Promise(() => {}); // Halt execution
        }
        return retryResponse;
      } catch (err) {
        console.error("Failed to refresh token", err);
        await auth.signOut();
        localStorage.clear();
        window.location.href = '/';
        return new Promise(() => {}); // Halt execution
      }
    } else {
      console.warn("401 received but no Firebase user found to refresh token. Forcing logout.");
      await auth.signOut();
      localStorage.clear();
      window.location.href = '/';
      return new Promise(() => {}); // Halt execution
    }
  }
  
  return response;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 20, background: 'white' }}>
          <h1>React Crashed</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
