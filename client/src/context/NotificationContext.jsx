import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { token, API, logout } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const data = await apiFetch(
        `${API}/api/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        },
        logout
      );

      setCount(data.count || 0);
    } catch (err) {
      console.error('Notification error:', err.message);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchCount();

    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <NotificationContext.Provider value={{ count, refresh: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);