import React from 'react';
import {createRoot} from 'react-dom/client';
import { LanguageProvider } from './utils/translations';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error?.message || String(error) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif', marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>عذراً، حدث خطأ أثناء التحميل</h2>
          <p style={{ color: '#e11d48', fontSize: 14, margin: '16px 0' }}>{this.state.error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', borderRadius: 12, backgroundColor: '#0d9488', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ErrorBoundary>
);
