import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Suppress error overlay for expected API errors in development
    if (process.env.NODE_ENV === 'development') {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason;
        
        // Check if it's our plain error object (has name and message, but not instanceof Error)
        if (reason && typeof reason === 'object' && 'name' in reason && 'message' in reason && !(reason instanceof Error)) {
          // This is our custom plain error object - suppress overlay
          event.preventDefault();
          console.warn('API error handled:', reason.message);
          return;
        }
        
        // Also suppress for specific error messages
        const reasonStr = String(reason?.message || reason || '');
        if (
          reasonStr.includes('Incorrect email or password') ||
          reasonStr.includes('Invalid credentials') ||
          reasonStr.includes('Email already registered') ||
          reasonStr.includes('LoginError') ||
          reasonStr.includes('RegistrationError') ||
          reasonStr.includes('ValidationError')
        ) {
          event.preventDefault();
          console.warn('Expected API error caught:', reasonStr);
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>Agent Mira - AI Real Estate Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f0c29" />
      </Head>
      <NavBar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

