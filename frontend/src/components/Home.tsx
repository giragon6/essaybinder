import { useState, useEffect } from "react";
import EssayCard from "./EssayCard";
import AuthComponent from "./AuthComponent";
import Landing from "./Landing";
import type { Essay, UserProfile } from "../models/essayModels";
import "./TapeRoll.css";

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [addingEssay, setAddingEssay] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [minWordCount, setMinWordCount] = useState("");
  const [maxWordCount, setMaxWordCount] = useState("");
  const [minCharCount, setMinCharCount] = useState("");
  const [maxCharCount, setMaxCharCount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState("");

  const handleUserChange = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      fetchEssays();
    } else {
      setEssays([]);
    }
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch(`/api/auth/user`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          if (userData.user) {
            fetchEssays();
          }
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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
        body: JSON.stringify({ url: newDocUrl.trim() }) 
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewDocUrl("");
        fetchEssays(); 
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
        fetchEssays();
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
        fetchEssays();
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const removeTagFromEssay = async (essayId: string, tag: string) => {
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
        fetchEssays();
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const updateEssayApplication = async (essayId: string, applicationFor: string, applicationStatus: string) => {
    try {
      const response = await fetch(`/api/essays/${essayId}/application`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ applicationFor, applicationStatus })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error updating essay application:", error);
    }
  };

  const updateEssayNotes = async (essayId: string, notes: string) => {
    try {
      const response = await fetch(`/api/essays/${essayId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error updating essay notes:", error);
    }
  };

  const allTags = Array.from(new Set(essays.flatMap(essay => essay.tags))).sort();

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    setMinWordCount("");
    setMaxWordCount("");
    setMinCharCount("");
    setMaxCharCount("");
    setSelectedApplicationStatus("");
  };

  const filteredEssays = essays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || essay.tags.includes(selectedTag);
    
    const matchesWordCount = (!minWordCount || essay.wordCount >= parseInt(minWordCount)) &&
      (!maxWordCount || essay.wordCount <= parseInt(maxWordCount));
    
    const matchesCharCount = (!minCharCount || essay.characterCount >= parseInt(minCharCount)) &&
      (!maxCharCount || essay.characterCount <= parseInt(maxCharCount));
    
    const matchesApplicationStatus = !selectedApplicationStatus || essay.applicationStatus === selectedApplicationStatus;
    
    return matchesSearch && matchesTag && matchesWordCount && matchesCharCount && matchesApplicationStatus;
  });

  return user ? (
    <div className="min-h-screen relative" style={{
      backgroundColor: '#faf7f0',
      backgroundImage: `
        linear-gradient(90deg, #e8dcc0 1px, transparent 1px),
        linear-gradient(180deg, #e8dcc0 1px, transparent 1px),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 23px,
          #d4c5a9 23px,
          #d4c5a9 24px
        )
      `,
      backgroundSize: '30px 24px, 100% 24px, 100% 24px'
    }}>
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 opacity-60"></div>
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto" style={{ marginLeft: '80px' }}>
        <div className="absolute top-6 right-6 transform rotate-2 user-menu-container" style={{ 
          fontFamily: 'Comic Sans MS, cursive',
          color: '#4a5568',
          fontSize: '18px',
          zIndex: 1000
        }}>
          <div className="flex items-center gap-2">
            <span>{user.name}</span>
            <button 
              className={`cursor-pointer hover:scale-110 transition-transform ${showUserMenu ? 'scale-110' : ''}`}
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ fontSize: '16px' }}
            >
              ✏️
            </button>
          </div>
          
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-amber-200 p-3 min-w-56 transform -rotate-1"
                 style={{ 
                   backgroundColor: '#fefdf7',
                   fontFamily: 'Comic Sans MS, cursive',
                   zIndex: 9999,
                   boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                   position: 'absolute'
                 }}>
              <AuthComponent onUserChange={handleUserChange} user={user} />
            </div>
          )}
        </div>

        <div>
            <div className="text-center mb-12 mt-8">
              <h1 className="text-6xl font-bold mb-4 font-serif drop-shadow-sm transform -rotate-1" style={{ color: '#2c3e50' }}>
                📝 Essay Binder
              </h1>
              <p className="text-lg italic transform rotate-1" style={{ 
                color: '#5d6d7e',
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                My personal collection of essays
              </p>
            </div>

            <div className="relative mb-8 inline-block">
              <div className="relative p-6 rounded-lg shadow-md border-2 transform hover:scale-102 transition-all duration-200" 
                   style={{
                     backgroundColor: '#fff9c4',
                     borderColor: '#fbbf24',
                     transform: 'rotate(-2deg)',
                     boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
                     maxWidth: '400px'
                   }}>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white bg-opacity-60 rounded-sm shadow-sm border border-gray-200"></div>
                
                <h3 className="text-lg font-medium mb-4 flex items-center" style={{ 
                  color: '#92400e',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  Add New Essay ✍️
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Paste Google Docs URL here..."
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className="w-full p-3 border-2 rounded-lg bg-white bg-opacity-80 placeholder-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    style={{ 
                      borderColor: '#d97706',
                      fontFamily: 'Comic Sans MS, cursive'
                    }}
                  />
                  <button 
                    onClick={addEssayByUrl}
                    disabled={addingEssay || !newDocUrl.trim()}
                    className="w-full py-3 rounded-lg disabled:opacity-50 transition-all transform hover:scale-105 font-medium shadow-md text-white"
                    style={{ 
                      backgroundColor: '#059669',
                      fontFamily: 'Comic Sans MS, cursive'
                    }}
                  >
                    {addingEssay ? '⏳ Adding...' : '➕ Add Essay'}
                  </button>
                </div>
              </div>
            </div>

            {/* Hand-drawn separator line */}
            <div className="my-12 relative">
              <svg width="100%" height="40" viewBox="0 0 800 40" className="overflow-visible">
                <path 
                  d="M 0 20 Q 200 10 400 25 T 800 15" 
                  stroke="#8b7355" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
                />
                <text 
                  x="50%" 
                  y="35" 
                  textAnchor="middle" 
                  style={{ 
                    fontFamily: 'Comic Sans MS, cursive',
                    fontSize: '14px',
                    fill: '#8b7355'
                  }}
                >
                  My Essays ↓
                </text>
              </svg>
            </div>

            <div className={`active-filters ${!searchTerm && !selectedTag && !minWordCount && !maxWordCount && !minCharCount && !maxCharCount && !selectedApplicationStatus ? 'empty' : ''}`}>
              {searchTerm && (
                <div className="tape-piece new-tape">
                  🔎 "{searchTerm}"
                  <span className="remove-tape" onClick={() => setSearchTerm("")}>×</span>
                </div>
              )}
              {selectedTag && (
                <div className="tape-piece new-tape">
                  🏷️ {selectedTag}
                  <span className="remove-tape" onClick={() => setSelectedTag("")}>×</span>
                </div>
              )}
              {selectedApplicationStatus && (
                <div className="tape-piece new-tape">
                  🎓 {selectedApplicationStatus.charAt(0).toUpperCase() + selectedApplicationStatus.slice(1)}
                  <span className="remove-tape" onClick={() => setSelectedApplicationStatus("")}>×</span>
                </div>
              )}
              {(minWordCount || maxWordCount) && (
                <div className="tape-piece new-tape">
                  📊 Words: {minWordCount || '0'}-{maxWordCount || '∞'}
                  <span className="remove-tape" onClick={() => { setMinWordCount(""); setMaxWordCount(""); }}>×</span>
                </div>
              )}
              {(minCharCount || maxCharCount) && (
                <div className="tape-piece new-tape">
                  🔤 Chars: {minCharCount || '0'}-{maxCharCount || '∞'}
                  <span className="remove-tape" onClick={() => { setMinCharCount(""); setMaxCharCount(""); }}>×</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <div 
                className={`tape-roll ${showFilters ? 'spinning' : ''}`}
                style={{ width: '120px', height: '60px', margin: '0 auto' }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="tape-roll-label">
                  {showFilters ? 'Close' : 'Filters'}
                </div>
              </div>

              {showFilters && (
                <div className="tape-menu">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ 
                        color: '#374151',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        🔎 Search Essays
                      </label>
                      <input
                        type="text"
                        placeholder="Search by title or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border-2 rounded-lg bg-white placeholder-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                        style={{ 
                          borderColor: '#d97706',
                          fontFamily: 'Comic Sans MS, cursive'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ 
                        color: '#374151',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        🏷️ Filter by Tag
                      </label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full p-3 border-2 rounded bg-white"
                        style={{ 
                          borderColor: '#d97706',
                          fontFamily: 'Comic Sans MS, cursive'
                        }}
                      >
                        <option value="">All tags</option>
                        {allTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ 
                        color: '#374151',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        🎓 Filter by Application Status
                      </label>
                      <select
                        value={selectedApplicationStatus}
                        onChange={(e) => setSelectedApplicationStatus(e.target.value)}
                        className="w-full p-3 border-2 rounded bg-white"
                        style={{ 
                          borderColor: '#d97706',
                          fontFamily: 'Comic Sans MS, cursive'
                        }}
                      >
                        <option value="">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="not-used">Not Used</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ 
                        color: '#374151',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        📊 Word Count Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minWordCount}
                          onChange={(e) => setMinWordCount(e.target.value)}
                          className="w-1/2 p-2 border-2 rounded"
                          style={{ 
                            borderColor: '#d97706',
                            fontFamily: 'Comic Sans MS, cursive'
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxWordCount}
                          onChange={(e) => setMaxWordCount(e.target.value)}
                          className="w-1/2 p-2 border-2 rounded"
                          style={{ 
                            borderColor: '#d97706',
                            fontFamily: 'Comic Sans MS, cursive'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ 
                        color: '#374151',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        🔤 Character Count Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minCharCount}
                          onChange={(e) => setMinCharCount(e.target.value)}
                          className="w-1/2 p-2 border-2 rounded"
                          style={{ 
                            borderColor: '#d97706',
                            fontFamily: 'Comic Sans MS, cursive'
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxCharCount}
                          onChange={(e) => setMaxCharCount(e.target.value)}
                          className="w-1/2 p-2 border-2 rounded"
                          style={{ 
                            borderColor: '#d97706',
                            fontFamily: 'Comic Sans MS, cursive'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 rounded-lg transition-all transform hover:scale-105 text-white"
                      style={{ 
                        backgroundColor: '#6b7280',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}
                    >
                      🗑️ Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold flex items-center transform -rotate-1" style={{ 
                  color: '#2c3e50',
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  📚 My Essays ({filteredEssays.length})
                </h3>
                {essays.length > 0 && (
                  <div className="text-sm transform rotate-1" style={{ 
                    color: '#5d6d7e',
                    fontFamily: 'Comic Sans MS, cursive'
                  }}>
                    Total: {essays.length} essays ✨
                  </div>
                )}
              </div>
              
              {loading && essays.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#d97706' }}></div>
                  <p className="text-xl mb-2 transform -rotate-1" style={{ 
                    color: '#5d6d7e',
                    fontFamily: 'Comic Sans MS, cursive'
                  }}>
                    Loading your essays...
                  </p>
                  <p className="mt-2 transform rotate-1" style={{ 
                    color: '#9ca3af',
                    fontFamily: 'Comic Sans MS, cursive'
                  }}>
                    Organizing your collection ✨
                  </p>
                </div>
              ) : filteredEssays.length === 0 ? (
                <div className="text-center py-12">
                  {essays.length === 0 ? (
                    <div className="transform -rotate-1">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-xl mb-4" style={{ 
                        color: '#5d6d7e',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        No essays in your collection yet
                      </p>
                      <p className="mb-6 transform rotate-1" style={{ 
                        color: '#9ca3af',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        Start building your personal essay library!
                      </p>
                      <div className="text-sm space-y-1" style={{ 
                        color: '#9ca3af',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        <p>💡 Add any Google Docs essay URL above</p>
                        <p>🏷️ Tag and organize your collection</p>
                        <p>🔍 Search and filter with ease</p>
                      </div>
                    </div>
                  ) : (
                    <div className="transform rotate-1">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-xl mb-2" style={{ 
                        color: '#5d6d7e',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        No essays match your filters
                      </p>
                      <p style={{ 
                        color: '#9ca3af',
                        fontFamily: 'Comic Sans MS, cursive'
                      }}>
                        Try adjusting your search or clearing filters
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEssays.map((essay) => (
                    <EssayCard 
                      key={essay.id} 
                      essay={essay} 
                      onAddTag={addTagToEssay}
                      onRemoveTag={removeTagFromEssay}
                      onRemoveEssay={removeEssay}
                      onUpdateApplication={updateEssayApplication}
                      onUpdateNotes={updateEssayNotes}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <Landing onUserChange={handleUserChange} />
    );
  }