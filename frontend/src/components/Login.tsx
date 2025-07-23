import { useState, useEffect } from "react";
// esLint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { googleAuth } from '../services/googleAuth';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    }
  };

  const handleLogin = () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/auth/callback`,
        response_type: 'code',
        scope: 'openid email profile https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly',
        access_type: 'offline',
        prompt: 'select_account'
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await googleAuth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="p-6">
      {!user ? (
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Sign in with Google'}
        </button>
      ) : (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}