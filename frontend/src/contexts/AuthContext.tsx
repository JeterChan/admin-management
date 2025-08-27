import React, { createContext, useContext, useState } from 'react';

interface Admin {
  adminId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  getAuthHeaders: () => { [key: string]: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// JWT Token utility functions
const TOKEN_KEY = 'admin_jwt_token';

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const getAuthHeaders = (): { [key: string]: string } => {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const checkAuth = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const currentToken = token || getStoredToken();
      
      if (!currentToken) {
        setUser(null);
        setToken(null);
        return;
      }

      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success' && result.isAuthenticated) {
        const authUser: Admin = {
          adminId: result.admin.id,
          email: result.admin.email,
          role: 'admin'
        };
        setUser(authUser);
        setToken(currentToken);
      } else {
        // Token is invalid or expired
        setUser(null);
        setToken(null);
        removeStoredToken();
      }
    } catch (error) {
      console.error('Check auth failed:', error);
      setUser(null);
      setToken(null);
      removeStoredToken();
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Check authentication status on app load
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success' && result.token) {
        const authUser: Admin = {
          adminId: result.admin.id,
          email: result.admin.email,
          role: 'admin'
        };

        // Store JWT token
        setStoredToken(result.token);
        setToken(result.token);
        setUser(authUser);
        
        console.log('✅ Login successful, JWT token stored');
        return true;
      } else {
        console.log(result);
        console.error('Login failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = (): void => {
    try {
      // Clear JWT token from storage and state
      removeStoredToken();
      setToken(null);
      setUser(null);
      
      console.log('✅ Logout successful, JWT token cleared');
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if something goes wrong
      removeStoredToken();
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};