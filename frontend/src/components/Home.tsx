import { useState, useEffect } from "react";
import type { UserProfile } from "../models/essayModels";

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const response = await fetch(`/api/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="home min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Essay Binder</h1>
              {user && (
                <nav className="ml-10">
                  <span className="text-blue-600 px-3 py-2 text-sm font-medium">
                    Home
                  </span>
                  <a href="/essays" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    My Essays
                  </a>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                  <button 
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a 
                  href="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize Your Essays<br />
            <span className="text-blue-600">Securely & Privately</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Essay Binder helps you catalog and organize your Google Docs essays without storing their content. 
            Keep your writing private while maintaining an organized collection.
          </p>
          
          {user ? (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a 
                href="/essays"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg inline-block"
              >
                View My Essays
              </a>
              <a 
                href="/essays"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium text-lg inline-block"
              >
                Add New Essay
              </a>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a 
                href="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg inline-block"
              >
                Get Started Free
              </a>
              <a 
                href="#features"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium text-lg inline-block"
              >
                Learn More
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Essay Binder?</h2>
            <p className="text-xl text-gray-600">Privacy-first essay organization for students and writers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600">We never store your essay content. Only metadata like title, tags, and word count are saved.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Organization</h3>
              <p className="text-gray-600">Tag, search, and categorize your essays. Find what you need quickly with powerful filters.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Google Docs Integration</h3>
              <p className="text-gray-600">Seamlessly connect with Google Docs. Add essays by simply pasting the URL.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to organize your essays?</h2>
            <p className="text-xl text-blue-100 mb-8">Start cataloging your Google Docs essays in seconds.</p>
            <a 
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-medium text-lg inline-block"
            >
              Sign in with Google
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Essay Binder</h3>
            <p className="text-gray-400 mb-4">Privacy-focused essay organization for writers and students.</p>
            <p className="text-gray-500 text-sm">
              Built with security and privacy in mind. Your content stays in your Google Docs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
