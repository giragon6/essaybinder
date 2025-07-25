import { useState, useCallback } from 'react';
import type { UserProfile } from '../models/essayModels';

export const useAuth = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState<UserProfile | null>(null);

  const handleUserChange = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        handleUserChange(null);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [handleUserChange]);

  const checkCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        return userData.user;
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    }
    return null;
  }, []);

  return {
    user,
    handleUserChange,
    handleLogout,
    checkCurrentUser
  };
};
