import { useState, useEffect } from "react";
import EssayCard from "./EssayCard";
import Landing from "./Landing";
import TrashCan from "./TrashCan";
import type { Essay, UserProfile, UserPositions, EssayPosition } from "../models/essayModels";
import "./TapeRoll.css";
import { Filters } from "./Filters";

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [addingEssay, setAddingEssay] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchMode, setTagSearchMode] = useState<'OR' | 'AND'>('OR');

  // Position management
  const [essayPositions, setEssayPositions] = useState<UserPositions>({});
  const [hasUnsavedPositions, setHasUnsavedPositions] = useState(false);

  const [minWordCount, setMinWordCount] = useState("");
  const [maxWordCount, setMaxWordCount] = useState("");
  const [minCharCount, setMinCharCount] = useState("");
  const [maxCharCount, setMaxCharCount] = useState("");
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState("");

  const handleUserChange = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      fetchEssays();
      fetchPositions();
    } else {
      setEssays([]);
      setEssayPositions({});
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEssayPositions(data.positions || {});
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const savePositions = async () => {
    try {
      const response = await fetch('/api/positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ positions: essayPositions })
      });
      
      if (response.ok) {
        setHasUnsavedPositions(false);
        alert('Positions saved successfully!');
      } else {
        alert('Failed to save positions');
      }
    } catch (error) {
      console.error("Error saving positions:", error);
      alert('Failed to save positions');
    }
  };

  const handlePositionChange = (essayId: string, position: EssayPosition) => {
    setEssayPositions(prev => ({
      ...prev,
      [essayId]: position
    }));
    setHasUnsavedPositions(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const essayData = e.dataTransfer.getData('application/essay-card');
    if (essayData) {
      try {
        const { essayId, offsetX, offsetY } = JSON.parse(essayData);
        const container = e.currentTarget.getBoundingClientRect();
        
        const newPosition: EssayPosition = {
          x: e.clientX - container.left - offsetX,
          y: e.clientY - container.top - offsetY,
          zIndex: 1
        };
        
        handlePositionChange(essayId, newPosition);
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getDefaultPosition = (index: number): EssayPosition => {
    // Auto-arrange essays in a grid pattern if no saved position
    const cols = 4;
    const cardWidth = 300;
    const cardHeight = 350;
    const marginX = 20;
    const marginY = 20;
    
    return {
      x: (index % cols) * (cardWidth + marginX),
      y: Math.floor(index / cols) * (cardHeight + marginY),
      zIndex: 1
    };
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
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

  const filteredEssays = essays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTags = true;
    if (selectedTags.length > 0) {
      if (tagSearchMode === 'OR') {
        // OR logic: essay must have at least one of the selected tags
        matchesTags = selectedTags.some(selectedTag => essay.tags.includes(selectedTag));
      } else {
        // AND logic: essay must have all selected tags
        matchesTags = selectedTags.every(selectedTag => essay.tags.includes(selectedTag));
      }
    }
    
    const matchesWordCount = (!minWordCount || essay.wordCount >= parseInt(minWordCount)) &&
      (!maxWordCount || essay.wordCount <= parseInt(maxWordCount));
    
    const matchesCharCount = (!minCharCount || essay.characterCount >= parseInt(minCharCount)) &&
      (!maxCharCount || essay.characterCount <= parseInt(maxCharCount));
    
    const matchesApplicationStatus = !selectedApplicationStatus || essay.applicationStatus === selectedApplicationStatus;
    
    return matchesSearch && matchesTags && matchesWordCount && matchesCharCount && matchesApplicationStatus;
  });

  return user ? (
    <div className="min-h-screen relative paper-background top-0">
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 opacity-60"></div>
      
      <div className="relative z-10 p-6 max-w-7xl ml-20 mr-0 pt-0">
        
        <div className="absolute right-6 transform rotate-2 user-menu-container text-gray-600 text-lg z-50 pt-6">
          <div className="flex items-center gap-2">
            <h1 className="text-6xl font-bold mr-10 mb-4 drop-shadow-sm transform -rotate-1 text-slate-800">
              Essay Binder
            </h1>

            <div 
              className="cursor-pointer right-0 top-3 absolute whiteout-container"
              onClick={handleLogout}
            >
              <span className="original-text">{user.name}</span>
              <div className="whiteout-overlay">
                Logout
              </div>
            </div>
          </div>
        </div>

        <div>
            <Filters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              tagSearchMode={tagSearchMode}
              setTagSearchMode={setTagSearchMode}
              minWordCount={minWordCount}
              setMinWordCount={setMinWordCount}
              maxWordCount={maxWordCount}
              setMaxWordCount={setMaxWordCount}
              minCharCount={minCharCount}
              setMinCharCount={setMinCharCount}
              maxCharCount={maxCharCount}
              setMaxCharCount={setMaxCharCount}
              selectedApplicationStatus={selectedApplicationStatus}
              setSelectedApplicationStatus={setSelectedApplicationStatus}
              allTags={essays.flatMap(essay => essay.tags)}
            />

            <div className="relative mt-40 mb-8 inline-block">
              <div className="relative p-6 rounded-lg shadow-md border-2 border-amber-400 bg-yellow-100 transform hover:scale-105 transition-all duration-200 max-w-sm -rotate-2 sticky-note-shadow">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white bg-opacity-60 rounded-sm shadow-sm border border-gray-200"></div>
                
                <h3 className="text-lg font-medium mb-4 flex items-center text-amber-800">
                  Add New Essay ✍️
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Paste Google Docs URL here..."
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className="w-full p-3 border-2 border-amber-600 rounded-lg bg-white bg-opacity-80 placeholder-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <button 
                    onClick={addEssayByUrl}
                    disabled={addingEssay || !newDocUrl.trim()}
                    className="w-full py-3 rounded-lg disabled:opacity-50 transition-all transform hover:scale-105 font-medium shadow-md text-white bg-emerald-600"
                  >
                    {addingEssay ? '⏳ Adding...' : '➕ Add Essay'}
                  </button>
                </div>
              </div>
            </div>

            <div className="my-12 relative">
              <svg width="100%" height="40" viewBox="0 0 800 40" className="overflow-visible">
                <path 
                  d="M 0 20 Q 200 10 400 25 T 800 15" 
                  stroke="#8b7355" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeLinecap="round"
                  className="svg-drop-shadow"
                />
                <text 
                  x="50%" 
                  y="35" 
                  textAnchor="middle" 
                  className="fill-amber-700 text-sm "
                >
                  My Essays ↓
                </text>
              </svg>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold flex items-center transform -rotate-1 text-slate-800 ">
                  📚 My Essays ({filteredEssays.length})
                </h3>
                <div className="flex items-center gap-4">
                  {essays.length > 0 && (
                    <div className="text-sm transform rotate-1 text-slate-600 ">
                      Total: {essays.length} essays ✨
                    </div>
                  )}
                  {hasUnsavedPositions && (
                    <button
                      onClick={savePositions}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      💾 Save Positions
                    </button>
                  )}
                </div>
              </div>
              
              {loading && essays.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-xl mb-2 transform -rotate-1 text-slate-600 ">
                    Loading your essays...
                  </p>
                  <p className="mt-2 transform rotate-1 text-gray-400 ">
                    Organizing your collection ✨
                  </p>
                </div>
              ) : filteredEssays.length === 0 ? (
                <div className="text-center py-12">
                  {essays.length === 0 ? (
                    <div className="transform -rotate-1">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-xl mb-4 text-slate-600 ">
                        No essays in your collection yet
                      </p>
                      <p className="mb-6 transform rotate-1 text-gray-400 ">
                        Start building your personal essay library!
                      </p>
                      <div className="text-sm space-y-1 text-gray-400 ">
                        <p>💡 Add any Google Docs essay URL above</p>
                        <p>🏷️ Tag and organize your collection</p>
                        <p>🔍 Search and filter with ease</p>
                      </div>
                    </div>
                  ) : (
                    <div className="transform rotate-1">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-xl mb-2 text-slate-600 ">
                        No essays match your filters
                      </p>
                      <p className="text-gray-400 ">
                        Try adjusting your search or clearing filters
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="relative min-h-[800px]" 
                  style={{ width: '100%', position: 'relative' }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {filteredEssays.map((essay, index) => {
                    const position = essayPositions[essay.id] || getDefaultPosition(index);
                    return (
                      <div
                        key={essay.id}
                        style={{
                          position: 'absolute',
                          left: position.x,
                          top: position.y,
                          zIndex: position.zIndex || 1
                        }}
                      >
                        <EssayCard 
                          essay={essay} 
                          onAddTag={addTagToEssay}
                          onRemoveTag={removeTagFromEssay}
                          onUpdateApplication={updateEssayApplication}
                          onUpdateNotes={updateEssayNotes}
                          onPositionChange={handlePositionChange}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trash Can for drag and drop deletion */}
        <TrashCan onDropEssay={removeEssay} />
      </div>
    ) : (
      <Landing onUserChange={handleUserChange} />
    );
  }