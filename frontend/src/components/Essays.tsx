import { useState, useEffect } from "react";
import EssayCard from "./EssayCard";
import DriveFilePicker from "./DriveFilePicker";
import type { Essay, UserProfile } from "../models/essayModels";

export default function Essays() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

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
        fetchEssays();
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Error checking user session:", error);
      window.location.href = '/login';
    }
  };

  const fetchEssays = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/essays`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEssays(data.essays || []);
      }
    } catch (error) {
      console.error("Error fetching essays:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (essayId: string, tag: string) => {
    try {
      const response = await fetch(`/api/essays/${essayId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ tag })
      });
      
      if (response.ok) {
        fetchEssays(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const removeTag = async (essayId: string, tag: string) => {
    try {
      const response = await fetch(`/api/essays/${essayId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ tag })
      });
      
      if (response.ok) {
        fetchEssays(); // Refresh the list
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const handleFileSelected = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch('/api/essays/add-by-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ fileId, fileName })
      });
      
      if (response.ok) {
        setShowFilePicker(false);
        fetchEssays(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add essay');
      }
    } catch (error) {
      console.error("Error adding essay by file:", error);
      alert('Failed to add essay');
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    try {
      const response = await fetch('/api/essays/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ url: urlInput.trim() })
      });
      
      if (response.ok) {
        setUrlInput("");
        setShowUrlInput(false);
        fetchEssays(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add essay');
      }
    } catch (error) {
      console.error("Error adding essay by URL:", error);
      alert('Failed to add essay');
    }
  };

  const removeEssay = async (essayId: string) => {
    try {
      const response = await fetch(`/api/essays/${essayId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchEssays(); // Refresh the list
      }
    } catch (error) {
      console.error("Error removing essay:", error);
    }
  };

  // Get all unique label values for filtering
  const allLabels = [...new Set(essays.flatMap(essay => 
    essay.driveLabels.map(label => label.value)
  ))].sort();

  const filteredEssays = essays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.driveLabels.some(label => label.value.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLabel = !selectedLabel || essay.driveLabels.some(label => label.value === selectedLabel);
    
    return matchesSearch && matchesLabel;
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Essay Binder</h1>
              <nav className="ml-10">
                <a href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Home
                </a>
                <span className="text-blue-600 px-3 py-2 text-sm font-medium">
                  My Essays
                </span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button 
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Section */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                � <strong>Privacy-First:</strong> Select only the Google Docs you want to analyze using our secure File Picker. 
                You maintain complete control over which files the app can access.
              </p>
            </div>
          </div>
        </div>

        {/* Add Essays Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add Essays to Your Collection</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilePicker(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Files (Recommended)
            </button>
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10.172 13.828 4-4a4 4 0 015.656 5.656l-1.1 1.102" />
              </svg>
              Add by URL
            </button>
          </div>
          
          {showUrlInput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label htmlFor="urlInput" className="block text-sm font-medium text-gray-700 mb-2">
                Google Docs URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="urlInput"
                  placeholder="https://docs.google.com/document/d/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: The document must be shared with the app or publicly accessible.
              </p>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Essays
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="labelFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Label
              </label>
              <select
                id="labelFilter"
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Labels</option>
                {allLabels.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Essays List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Your Essays ({filteredEssays.length} of {essays.length})
            </h2>
            {loading && (
              <div className="flex items-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Loading essays...</span>
              </div>
            )}
          </div>
          <div className="p-6">
            {filteredEssays.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.814 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No essays found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {essays.length === 0 
                    ? "Get started by adding your first Google Docs essay using the File Picker above."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {essays.length === 0 && (
                  <button
                    onClick={() => setShowFilePicker(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Your Google Docs
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredEssays.map((essay) => (
                  <EssayCard 
                    key={essay.id} 
                    essay={essay} 
                    onAddTag={addTag}
                    onRemoveTag={removeTag}
                    onRemoveEssay={removeEssay}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Picker Modal */}
      <DriveFilePicker
        isVisible={showFilePicker}
        onFileSelected={handleFileSelected}
        onCancel={() => setShowFilePicker(false)}
      />
    </div>
  );
}
