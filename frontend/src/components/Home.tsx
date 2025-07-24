import { useState, useEffect } from "react";
import EssayCard from "./EssayCard";
import type { Essay, UserProfile } from "../models/essayModels";

declare global {
  interface Window {
    gapi: any;
    init: () => void;
  }
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [addingEssay, setAddingEssay] = useState(false);

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
      }
    } catch (error) {
      console.error("Error checking user session:", error);
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

  const addEssayByUrl = async () => {
    if (!newDocUrl.trim()) return;
    setAddingEssay(true);
    try {
      const response = await fetch(`/api/essays/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ url: newDocUrl.trim() }) // Changed from googleDocUrl to url
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewDocUrl("");
        fetchEssays(); // Refresh the list
        alert("Essay added successfully!");
      } else {
        alert(data.error || "Failed to add essay");
      }
    } catch (error) {
      console.error("Error adding essay:", error);
      alert("Failed to add essay");
    } finally {
      setAddingEssay(false);
    }
  };

  const removeEssay = async (essayId: string) => {
    if (!confirm("Remove this essay from your catalog? This won't delete the Google Doc.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/essays/${essayId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchEssays(); // Refresh the list
      } else {
        alert("Failed to remove essay");
      }
    } catch (error) {
      console.error("Error removing essay:", error);
      alert("Failed to remove essay");
    }
  };

  const addTagToEssay = async (essayId: string, tag: string) => {
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

  const filteredEssays = essays.filter(essay =>
    essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    essay.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    essay.theme?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home p-6">
      <h1 className="text-4xl font-bold mb-6">Essay Binder</h1>
      
      {user ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
            
            {/* Add Essay Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-2">Add Essay to Catalog</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Google Docs URL here..."
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button 
                  onClick={addEssayByUrl}
                  disabled={addingEssay || !newDocUrl.trim()}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {addingEssay ? 'Adding...' : 'Add Essay'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                📋 Copy and paste the URL of any Google Doc you want to catalog. We'll only store metadata, not the content.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search essays by title, tags, or theme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid gap-4">
            <h3 className="text-xl font-semibold">Your Essays ({filteredEssays.length})</h3>
            
            {loading && essays.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading essays...</p>
              </div>
            ) : filteredEssays.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No essays in your catalog yet.</p>
                <p className="text-sm text-gray-500">Add a Google Doc URL above to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEssays.map((essay) => (
                  <EssayCard 
                    key={essay.id} 
                    essay={essay} 
                    onAddTag={addTagToEssay}
                    onRemoveEssay={removeEssay}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Please log in to access your essay collection</h2>
          <p className="text-gray-600 mb-4">Connect your Google account to start cataloging your essays</p>
          <a 
            href="/login" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block"
          >
            Sign in with Google
          </a>
        </div>
      )}
    </div>
  );
}