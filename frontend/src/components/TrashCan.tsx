import { useState } from 'react';

interface TrashCanProps {
  onDropEssay: (essayId: string) => void;
}

export default function TrashCan({ onDropEssay }: TrashCanProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const essayId = e.dataTransfer.getData('text/plain');
    if (essayId) {
      if (window.confirm("Remove this essay from your catalog? This won't delete the Google Doc.")) {
        onDropEssay(essayId);
      }
    }
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 border-4 ${
        isDragOver 
          ? 'scale-125 bg-red-500 text-white shadow-2xl border-red-300 animate-pulse' 
          : 'bg-gray-600 text-gray-300 hover:bg-red-400 hover:text-white shadow-lg border-gray-400 hover:border-red-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: isDragOver ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
      }}
      title="Drag essays here to delete them"
    >
      <div className={`text-3xl transition-all duration-200 ${isDragOver ? 'animate-bounce' : ''}`}>
        {isDragOver ? '🔥' : '🗑️'}
      </div>
      {isDragOver && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg animate-bounce">
          Drop to delete!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
        </div>
      )}
    </div>
  );
}
