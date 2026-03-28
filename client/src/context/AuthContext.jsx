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
        .then(r => r.json())
        .then(data => {
          if (data.user) setUser(data.user);
          else logout();
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    // sessionStorage clears automatically when browser tab closes
    sessionStorage.setItem('sq_token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sq_token');
  };

  // Call this after editing profile to update UI instantly
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