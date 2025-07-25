interface AddEssayFormProps {
  newDocUrl: string;
  setNewDocUrl: (url: string) => void;
  addEssayByUrl: () => void;
  addingEssay: boolean;
}

export default function AddEssayForm({ newDocUrl, setNewDocUrl, addEssayByUrl, addingEssay }: AddEssayFormProps) {
  return (
    <div className="relative">
      <div className="relative p-6 bg-amber-200 max-w-md transform -rotate-1 sticky-note-shadow">
        
        <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">
          add a new essay
        </h3>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Paste Google Docs URL here..."
            value={newDocUrl}
            onChange={(e) => setNewDocUrl(e.target.value)}
            className="w-full p-3 text-gray-500 !border-none !outline-none !focus:outline-none !focus:ring-0 !bg-transparent !focus:bg-transparent"
          />
          
          <div className="flex items-center justify-center mt-6 relative">
            <div className="flex items-center mr-4">
              <span className="text-lg font-bold text-gray-700 transform -rotate-12">add</span>
              <span className="text-gray-700 ml-1 transform rotate-12">→</span>
            </div>
            
            <button 
              onClick={addEssayByUrl}
              disabled={addingEssay || !newDocUrl.trim()}
              className="group relative disabled:opacity-50 transition-all transform hover:scale-110"
            >
              <div className="flex space-x-2 cursor-pointer">
                <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-red-600 relative">
                  <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-red-600 border-2 border-red-700 rounded-full"></div>
                </div>
                
                <div className="w-6 h-6 bg-blue-500 rounded-full shadow-lg border-2 border-blue-600 relative transform rotate-12">
                  <div className="absolute top-1/1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 border-2 border-blue-700 rounded-full"></div>
                </div>
                
                <div className="w-6 h-6 bg-green-500 rounded-full shadow-lg border-2 border-green-600 relative transform -rotate-6">
                  <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-green-600 border-2 border-green-700 rounded-full"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
