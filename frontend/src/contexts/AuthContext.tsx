import React, { createContext, useContext, useState } from 'react';

interface Admin {
  adminId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: Admin | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on app load
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        console.log('✅ Login API successful, now verifying session...');
        
        // First set user from login response
        const authUser: Admin = {
          adminId: result.admin.id,
          email: result.admin.email,
          role: 'admin'
        };
        setUser(authUser);
        
        // Then verify session was created properly by calling checkAuth
        setTimeout(async () => {
          console.log('🔍 Verifying session after login...');
          await checkAuth();
        }, 100); // Small delay to let cookies be set
        
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

  const logout = async (): Promise<void> => {
    try {
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      await fetch(`${REACT_APP_API_BASE_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear user state regardless of API call success
      setUser(null);
    }
  };


  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};