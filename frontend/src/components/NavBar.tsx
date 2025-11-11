import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/NavBar.module.css';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  // Don't show navbar on landing, login, or register pages
  if (router.pathname === '/landing' || router.pathname === '/login' || router.pathname === '/register') {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.title}>
          Agent Mira 🏡
        </Link>
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link href="/saved" className={styles.link}>
                Saved Properties
              </Link>
              {user && (
                <span className={styles.userName}>{user.name}</span>
              )}
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Login
              </Link>
              <Link href="/register" className={styles.link}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

