import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const API = import.meta.env.VITE_API_URL;

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    platform_fee_percent: 5,
    allow_signups: true,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    // Poll every 30 seconds for settings changes
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/api/users/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
