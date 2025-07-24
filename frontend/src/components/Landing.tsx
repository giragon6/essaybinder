import { useState, useEffect } from "react";
// @ts-ignore
import { googleAuth } from '../services/googleAuth';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface LandingProps {
  onUserChange: (user: User | null) => void;
}

export default function Landing({ onUserChange }: LandingProps) {
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

  return (
    <div className="min-h-screen relative paper-background">
      {/* Left margin line */}
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 opacity-60"></div>
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto ml-20">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-6xl font-bold mb-4 font-serif drop-shadow-sm transform -rotate-1 text-slate-800">
            📝 Essay Binder
          </h1>
          <p className="text-lg italic transform rotate-1 text-slate-600 ">
            Your personal collection of essays
          </p>
        </div>

        {/* Landing Content */}
        <div className="text-center">
          <div className="transform -rotate-1 max-w-md mx-auto">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold mb-4 text-slate-800 ">
              Welcome!
            </h2>
            <p className="mb-6 text-lg transform rotate-1 text-slate-600 ">
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

        {/* Feature Preview */}
        <div className="mt-16 text-center">
          <div className="transform rotate-1">
            <h3 className="text-2xl font-semibold mb-8" style={{ 
              color: '#2c3e50',
              fontFamily: 'Comic Sans MS, cursive'
            }}>
              What you can do with Essay Binder ✨
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Feature 1 */}
              <div className="transform -rotate-1 p-6 rounded-lg border-2" style={{
                backgroundColor: '#fff9c4',
                borderColor: '#fbbf24',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div className="text-4xl mb-4">📎</div>
                <h4 className="text-lg font-medium mb-2" style={{ 
                  color: '#92400e',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Easy Import
                </h4>
                <p className="text-sm" style={{ 
                  color: '#92400e',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Just paste any Google Docs URL and we'll catalog your essay automatically
                </p>
              </div>

              {/* Feature 2 */}
              <div className="transform rotate-2 p-6 rounded-lg border-2" style={{
                backgroundColor: '#fef3c7',
                borderColor: '#f59e0b',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div className="text-4xl mb-4">🏷️</div>
                <h4 className="text-lg font-medium mb-2" style={{ 
                  color: '#92400e',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Smart Organization
                </h4>
                <p className="text-sm" style={{ 
                  color: '#92400e',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Tag, filter, and search through your collection with ease
                </p>
              </div>

              {/* Feature 3 */}
              <div className="transform -rotate-2 p-6 rounded-lg border-2" style={{
                backgroundColor: '#ecfdf5',
                borderColor: '#10b981',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-lg font-medium mb-2" style={{ 
                  color: '#065f46',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Track Progress
                </h4>
                <p className="text-sm" style={{ 
                  color: '#065f46',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Monitor word counts, character counts, and essay statistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
