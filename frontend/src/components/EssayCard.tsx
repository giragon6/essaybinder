import { useState } from "react";
import type { EssayCardProps } from "../models/essayModels";

export default function EssayCard({ essay, onAddTag, onRemoveEssay }: EssayCardProps) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(essay.id, newTag.trim());
      setNewTag("");
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

      {essay.theme && (
        <div className="mb-2">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
            Theme: {essay.theme}
          </span>
        </div>
      )}

      <div className="mb-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {essay.tags.map((tag) => (
            <span 
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 p-1 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Created: {new Date(essay.createdDate).toLocaleDateString()} • 
        Modified: {new Date(essay.lastModified).toLocaleDateString()}
      </div>
    </div>
  );
}