import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { getSavedProperties, unsaveProperty } from '../lib/api';
import { Property } from '../types/property';
import styles from '../styles/SavedPage.module.css';

export default function SavedPage() {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/landing');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedProperties();
    }
  }, [isAuthenticated]);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSavedProperties();
      console.log('Saved properties response:', response.data);
      const properties = response.data?.saved_properties || [];
      console.log('Number of saved properties:', properties.length);
      
      // Format properties to match PropertyCard interface
      const formattedProperties = properties.map((prop: any) => {
        console.log('Formatting property:', prop);
        return {
          id: String(prop.id || ''),
          title: prop.title || 'Untitled Property',
          price: typeof prop.price === 'number' ? prop.price.toLocaleString() : (prop.price || '0'),
          location: prop.location || 'Unknown Location',
          bedrooms: prop.bedrooms || prop.bedrooms_count || 0,
          image: prop.image || prop.image_url || undefined,
        };
      });
      
      console.log('Formatted properties:', formattedProperties);
      setSavedProperties(formattedProperties);
    } catch (err: any) {
      console.error('Error fetching saved properties:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load saved properties';
      setError(errorMsg);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (propertyId: string) => {
    try {
      await unsaveProperty(propertyId);
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      console.error('Error unsaving property:', err);
      alert('Failed to remove property from saved list');
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Saved Properties - Agent Mira</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Saved Properties</h1>
          {error && <div className={styles.error}>{error}</div>}
          
          {savedProperties.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <p className={styles.description}>
                {error ? `Error: ${error}` : "You haven't saved any properties yet."}
              </p>
              {error && (
                <button onClick={fetchSavedProperties} className={styles.link} style={{marginTop: '1rem'}}>
                  Retry
                </button>
              )}
              <Link href="/" className={styles.link}>
                ← Back to Chat
              </Link>
            </div>
          ) : savedProperties.length > 0 ? (
            <>
              <p className={styles.description}>
                You have {savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}
              </p>
              <div className={styles.propertiesGrid}>
                {savedProperties.map((property) => (
                  <div key={property.id} className={styles.propertyWrapper}>
                    <PropertyCard
                      property={property}
                      onSave={() => handleUnsave(property.id)}
                      isSaving={false}
                    />
                    <button
                      onClick={() => handleUnsave(property.id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <Link href="/" className={styles.link}>
                ← Back to Chat
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

