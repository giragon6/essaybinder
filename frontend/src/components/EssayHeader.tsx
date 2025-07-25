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

    { hasUnsavedPositions && <div 
      className={'fixed bottom-8 right-32 z-50 bg-gray-200 transition-all duration-300 border-4 border-gray-400'}
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onSavePositions}
      title="Click here to save current essay position"
    >
      <div className={'text-3xl transition-all duration-200'}>
        💾
      </div>
    </div>}
    </>
  );
}
