interface EssayHeaderProps {
  userName: string;
  essayCount: number;
  totalEssays: number;
  hasUnsavedPositions: boolean;
  onLogout: () => void;
  onSavePositions: () => void;
}

export default function EssayHeader({ 
  userName, 
  essayCount, 
  totalEssays, 
  hasUnsavedPositions, 
  onLogout, 
  onSavePositions 
}: EssayHeaderProps) {
  return (
    <>
      <div className="text-center min-w-screen mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-700 transform -rotate-1">
          <div 
            className="cursor-pointer whiteout-container"
            onClick={onLogout}
          >
            <span className="original-text">{userName?.split(' ')[0] || 'user'}'s</span>
            <div className="whiteout-overlay">
              Logout
            </div>
          </div>
        </h1>
        <h2 className="text-5xl font-bold text-gray-900 transform rotate-1 tracking-wider">
          ESSAY BINDER
        </h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {totalEssays > 0 && (
            <div className="text-sm transform rotate-1 text-slate-600">
              I have <span className="text-amber-600">{totalEssays} essay{totalEssays > 1 ? 's' : ''}</span>!
            </div>
          )}
          {hasUnsavedPositions && (
            <button
              onClick={onSavePositions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
            >
              💾 Save Positions
            </button>
          )}
        </div>
      </div>
    </>
  );
}
