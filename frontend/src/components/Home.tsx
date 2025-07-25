import { useEffect } from "react";
import Landing from "./Landing";
import TrashCan from "./TrashCan";
import AddEssayForm from "./AddEssayForm";
import EssayHeader from "./EssayHeader";
import EssayGrid from "./EssayGrid";
import { Filters } from "./Filters";
import { useAuth } from "../hooks/useAuth";
import { useEssays } from "../hooks/useEssays";
import { useFilters } from "../hooks/useFilters";
import { usePositions } from "../hooks/usePositions";
import { filterEssays } from "../utils/essayFilters";
import "./TapeRoll.css";

export default function Home() {
  const { user, handleUserChange, handleLogout, checkCurrentUser } = useAuth();
  const { 
    essays, 
    loading, 
    addingEssay, 
    newDocUrl, 
    setNewDocUrl, 
    fetchEssays, 
    addEssayByUrl, 
    removeEssay, 
    addTagToEssay, 
    removeTagFromEssay, 
    updateEssayApplication, 
    updateEssayNotes 
  } = useEssays();
  const { 
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    tagSearchMode,
    setTagSearchMode,
    minWordCount,
    setMinWordCount,
    maxWordCount,
    setMaxWordCount,
    minCharCount,
    setMinCharCount,
    maxCharCount,
    setMaxCharCount,
    selectedApplicationStatus,
    setSelectedApplicationStatus
  } = useFilters();
  const { 
    essayPositions, 
    hasUnsavedPositions, 
    fetchPositions, 
    savePositions, 
    handlePositionChange, 
    getDefaultPosition, 
    handleDrop, 
    handleDragOver, 
    clearPositions 
  } = usePositions();

  useEffect(() => {
    if (user) {
      fetchEssays();
      fetchPositions();
    } else {
      clearPositions();
    }
  }, [user, fetchEssays, fetchPositions, clearPositions]);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = await checkCurrentUser();
      if (currentUser) {
        handleUserChange(currentUser);
      }
    };
    initializeAuth();
  }, [checkCurrentUser, handleUserChange]);

  const filteredEssays = filterEssays(essays, {
    searchTerm,
    selectedTags,
    tagSearchMode,
    minWordCount,
    maxWordCount,
    minCharCount,
    maxCharCount,
    selectedApplicationStatus
  });

  return user ? (
    <div className="min-h-screen relative paper-background top-0">
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 opacity-60"></div>
      
      <div className="relative z-10 p-6 max-w-7xl ml-20 mr-0 pt-0">

        <EssayHeader
          userName={user.name}
          essayCount={filteredEssays.length}
          totalEssays={essays.length}
          hasUnsavedPositions={hasUnsavedPositions}
          onLogout={handleLogout}
          onSavePositions={savePositions}
        />

        <div className="relative mb-8">
          <div className="absolute top-0 left-0 z-20">
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
          </div>
        </div>

        <div className="relative">
          <div className="mt-40 left-32 z-10">
            <AddEssayForm
              newDocUrl={newDocUrl}
              setNewDocUrl={setNewDocUrl}
              addEssayByUrl={addEssayByUrl}
              addingEssay={addingEssay}
            />
          </div>
        </div>

        <div className="mt-48 relative z-5">

          <div className="mb-6">
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
                      No essays yet
                    </p>
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
              <EssayGrid
                essays={filteredEssays}
                essayPositions={essayPositions}
                getDefaultPosition={getDefaultPosition}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onAddTag={addTagToEssay}
                onRemoveTag={removeTagFromEssay}
                onUpdateApplication={updateEssayApplication}
                onUpdateNotes={updateEssayNotes}
                onPositionChange={handlePositionChange}
              />
            )}
          </div>
        </div>
        
        <TrashCan onDropEssay={removeEssay} />
      </div>
    </div>
  ) : (
    <Landing onUserChange={handleUserChange} />
  );
}