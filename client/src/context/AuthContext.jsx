import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('sq_token'));
  const [loading, setLoading] = useState(true);

  // On app load — verify token with server and get fresh user data
  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => {
          // FIX: only logout on auth failure (401/403), not on network errors
          if (r.status === 401 || r.status === 403) {
            logout();
            setLoading(false);
            return null;
          }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          if (data.user) setUser(data.user);
          else logout();
        })
        .catch(() => {
          // FIX: network error — keep the token, don't force logout
          console.warn('Could not reach server on startup, keeping session.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    sessionStorage.setItem('sq_token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sq_token');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);