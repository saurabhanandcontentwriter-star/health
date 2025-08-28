

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AuthLog, User, UserSession } from '../types';
import * as db from '../services/dbService';

interface AuthContextType {
  user: User | null;
  login: (phone: string) => Promise<void>;
  signup: (firstName: string, lastName: string, phone: string, email?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  authLogs: AuthLog[];
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  
  const sessionStartTimeRef = useRef<number | null>(null);
  const activeUserRef = useRef<User | null>(null);
  activeUserRef.current = user;

  const refreshAuthLogs = useCallback(() => {
    setAuthLogs(db.getAuthLogs());
  }, []);

  const refreshAuth = useCallback(() => {
    try {
      const storedUserJson = localStorage.getItem('bhc-user');
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
        if(storedUser && storedUser.phone) {
            const freshUser = db.getUserByPhone(storedUser.phone);
            if(freshUser) setUser(freshUser);
        }
      }
      refreshAuthLogs();
    } catch (error) {
      console.error('Failed to restore session from localStorage:', error);
      setUser(null);
      localStorage.removeItem('bhc-user');
    }
  }, [refreshAuthLogs]);

  const endSession = useCallback(() => {
    const startTime = sessionStartTimeRef.current;
    const currentUser = activeUserRef.current;

    if (startTime && currentUser) {
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000); // in seconds
        
        if (duration > 5) { // Only log sessions longer than 5 seconds
            const sessionData: Omit<UserSession, 'id'> = {
                userId: currentUser.id,
                userName: `${currentUser.firstName} ${currentUser.lastName}`,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                duration: duration,
            };
            db.addSession(sessionData);
        }
    }
    sessionStartTimeRef.current = null;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      } else if (document.visibilityState === 'visible' && activeUserRef.current && !sessionStartTimeRef.current) {
        // Start a new session if tab becomes visible again and there's a user
        sessionStartTimeRef.current = Date.now();
      }
    };

    if (user) {
      sessionStartTimeRef.current = Date.now();
      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', endSession); // For tab/browser close

      return () => {
        endSession(); // End session on logout or component unmount
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', endSession);
      };
    }
  }, [user, endSession]);

  useEffect(() => {
    setLoading(true);
    refreshAuth();
    setLoading(false);
  }, [refreshAuth]);

  const login = async (phone: string) => {
    const userToLogin = db.getUserByPhone(phone);
    if (!userToLogin) {
      throw new Error("No user found with this phone number. Please check the number or sign up.");
    }
    setUser(userToLogin);
    localStorage.setItem('bhc-user', JSON.stringify(userToLogin));
    db.addAuthLog({ userName: `${userToLogin.firstName} ${userToLogin.lastName}`, userPhone: userToLogin.phone, role: userToLogin.role, action: 'login', location: 'Patna, IN' });
    refreshAuthLogs();
  };

  const signup = async (firstName: string, lastName: string, phone: string, email?: string) => {
    const newUser = db.addUser({ firstName, lastName, phone, email });
    setUser(newUser);
    localStorage.setItem('bhc-user', JSON.stringify(newUser));
    db.addAuthLog({ userName: `${newUser.firstName} ${newUser.lastName}`, userPhone: newUser.phone, role: newUser.role, action: 'login', location: 'Patna, IN' });
    refreshAuthLogs();
  };

  const logout = () => {
    endSession(); // Explicitly end session on logout
    if (user) {
        db.addAuthLog({ userName: `${user.firstName} ${user.lastName}`, userPhone: user.phone, role: user.role, action: 'logout', location: 'Patna, IN' });
        refreshAuthLogs();
    }
    setUser(null);
    localStorage.removeItem('bhc-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading, authLogs, refreshAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};