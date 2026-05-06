import { createContext, useContext, useState, useCallback } from 'react';
import { USERS } from '../data/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cococarbon_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email, password, role) => {
    const found = USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      const userData = { ...found };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('cococarbon_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Email, mật khẩu hoặc vai trò không đúng' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cococarbon_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
