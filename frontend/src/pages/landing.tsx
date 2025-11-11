import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Mira - Your AI Real Estate Assistant</title>
        <meta name="description" content="Find your dream home with Agent Mira" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.navbar}>
        <div className={styles.logo}>Agent Mira</div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/register" className={styles.primaryButton}>Sign Up</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Find Your Dream Home with <span>AI</span>
          </h1>
          <p className={styles.subtitle}>
            Agent Mira helps you discover properties that match your preferences using advanced AI technology.
          </p>
          <div className={styles.ctaContainer}>
            <Link href="/register" className={styles.ctaButton}>
              Get Started
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              Sign In
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Smart Search</h3>
            <p>Find properties that match your exact needs with our AI-powered search.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💡</div>
            <h3>AI Recommendations</h3>
            <p>Get personalized property recommendations based on your preferences.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Chat Support</h3>
            <p>Chat with our AI assistant to get instant answers to your questions.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Agent Mira. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
