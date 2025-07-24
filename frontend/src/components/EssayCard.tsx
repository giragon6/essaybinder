import { useState } from "react";
import type { EssayCardProps } from "../models/essayModels";

export default function EssayCard({ essay, onAddTag, onRemoveTag, onRemoveEssay }: EssayCardProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    setIsAddingTag(true);
    try {
      await onAddTag(essay.id, newTag.trim());
      setNewTag("");
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await onRemoveTag(essay.id, tag);
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-blue-600 flex-1">
          <a 
            href={`https://docs.google.com/document/d/${essay.googleDocId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {essay.title}
          </a>
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {essay.characterCount} chars • {essay.wordCount} words
          </div>
          <button
            onClick={() => onRemoveEssay(essay.id)}
            className="text-red-500 hover:text-red-700 text-sm"
            title="Remove from catalog"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-3">
        {/* Display tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {essay.tags && essay.tags.length > 0 ? (
            essay.tags.map((tag, index) => (
              <span 
                key={`${tag}-${index}`}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800 ml-1"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm italic">No tags</span>
          )}
        </div>
        
        {/* Add tag form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 p-1 border border-gray-300 rounded text-sm"
            disabled={isAddingTag}
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            disabled={!newTag.trim() || isAddingTag}
          >
            {isAddingTag ? 'Adding...' : 'Add Tag'}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Created: {new Date(essay.createdDate).toLocaleDateString()} • 
        Modified: {new Date(essay.lastModified).toLocaleDateString()} •
        Added via: {essay.addedVia === 'file-picker' ? 'File Picker' : 'URL'}
      </div>
    </div>
  );
}