import { useState, useEffect } from "react";
// @ts-ignore
import { googleAuth } from '../services/googleAuth';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthComponentProps {
  onUserChange: (user: User | null) => void;
  user: User | null;
}

export default function AuthComponent({ onUserChange, user }: AuthComponentProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await fetch(`/api/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        onUserChange(userData.user);
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await googleAuth.signIn();
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to start login process");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await googleAuth.signOut();
      
      if (response.ok) {
        onUserChange(null);
      } else {
        alert("Failed to logout");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout");
    }
  };

  if (user) {
    return (
      <div className="text-sm text-gray-600 mb-2 pb-2 border-b border-amber-200">
        Signed in as:
        <div className="font-medium text-gray-800">{user.name}</div>
        {user.email && (
          <div className="text-xs text-gray-500">{user.email}</div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-red-50 transition-colors text-red-600 font-medium mt-2"
        >
          🚪 Sign Out
        </button>
      </div>
    );
  }

  // Return login component
  return (
    <div className="text-center">
      <div className="transform -rotate-1 max-w-md mx-auto">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-3xl font-bold mb-4" style={{ 
          color: '#2c3e50',
          fontFamily: 'Comic Sans MS, cursive'
        }}>
          Welcome!
        </h2>
        <p className="mb-6 text-lg transform rotate-1" style={{ 
          color: '#5d6d7e',
          fontFamily: 'Comic Sans MS, cursive'
        }}>
          Connect your Google account to start building your personal essay collection
        </p>
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg text-white cursor-pointer border-none disabled:opacity-50"
          style={{ 
            backgroundColor: '#3b82f6',
            fontFamily: 'Comic Sans MS, cursive'
          }}
        >
          {loading ? '🔄 Redirecting...' : '🚀 Sign in with Google'}
        </button>
        <div className="mt-6 text-sm space-y-1 transform -rotate-1" style={{ 
          color: '#9ca3af',
          fontFamily: 'Comic Sans MS, cursive'
        }}>
          <p>✨ Organize your essays with tags</p>
          <p>📊 Track word and character counts</p>
          <p>🔍 Search and filter with ease</p>
        </div>
      </div>
    </div>
  );
}
