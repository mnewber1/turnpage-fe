import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to check admin status (Jackson serializes isAdmin as "admin")
  const checkIsAdmin = (u: User): boolean => {
    return u.isAdmin === true || u.admin === true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          if (checkIsAdmin(currentUser)) {
            setUser(currentUser);
          } else {
            api.logout();
          }
        } catch {
          api.logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      localStorage.setItem('admin_user_id', response.userId);

      const currentUser = await api.getCurrentUser();
      if (!checkIsAdmin(currentUser)) {
        api.logout();
        return false;
      }

      setUser(currentUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
