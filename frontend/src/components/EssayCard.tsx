import { useState } from "react";
import type { EssayCardProps } from "../models/essayModels";
import "./StickyNote.css";

export default function EssayCard({ essay, onAddTag, onRemoveTag, onRemoveEssay, onUpdateApplication, onUpdateNotes }: EssayCardProps) {
  const [newTag, setNewTag] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(essay.notes || "");
  const [editingApplication, setEditingApplication] = useState(false);
  const [tempApplicationFor, setTempApplicationFor] = useState(essay.applicationFor || "");
  const [tempApplicationStatus, setTempApplicationStatus] = useState<'draft' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'not-used'>(essay.applicationStatus || "draft");

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(essay.id, newTag.trim());
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onRemoveTag(essay.id, tag);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(essay.id, tempNotes);
    setEditingNotes(false);
  };

  const handleSaveApplication = () => {
    onUpdateApplication(essay.id, tempApplicationFor, tempApplicationStatus);
    setEditingApplication(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'waitlisted': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'not-used': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-orange-100 text-orange-800 border-orange-300'; // draft
    }
  };

  // Array of sticky note colors
  const colors = [
    'bg-yellow-200 border-yellow-300',
    'bg-pink-200 border-pink-300', 
    'bg-blue-200 border-blue-300',
    'bg-green-200 border-green-300',
    'bg-purple-200 border-purple-300',
    'bg-orange-200 border-orange-300'
  ];
  
  // Use essay ID to consistently assign a color
  const colorIndex = essay.id.charCodeAt(essay.id.length - 1) % colors.length;
  const stickyColor = colors[colorIndex];

  return (
    <div className={`relative group ${stickyColor} rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 min-h-[300px] max-w-[280px] mx-auto cursor-pointer border-2`}
         style={{
           transform: `rotate(${Math.random() * 6 - 3}deg)`,
           boxShadow: '4px 4px 8px rgba(0,0,0,0.1)'
         }}
         onClick={() => setIsFlipped(!isFlipped)}>
      
      {/* Tape effect */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white bg-opacity-60 rounded-sm shadow-sm border border-gray-200"></div>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemoveEssay(essay.id);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
        title="Remove from collection"
      >
        ✕
      </button>

      {!isFlipped ? (
        /* Front of sticky note */
        <div className="h-full flex flex-col">
          {/* Title */}
          <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-3 font-serif leading-tight">
            <a 
              href={`https://docs.google.com/document/d/${essay.googleDocId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {essay.title}
            </a>
          </h4>

          {/* Stats */}
          <div className="text-sm text-gray-700 mb-4 bg-white bg-opacity-50 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">📊 Stats</span>
              <span className="text-xs text-gray-600">Click to flip</span>
            </div>
            <div className="mt-1 space-y-1">
              <div>📝 {essay.wordCount.toLocaleString()} words</div>
              <div>🔤 {essay.characterCount.toLocaleString()} characters</div>
            </div>
          </div>

          {/* Application Info */}
          {(essay.applicationFor || essay.applicationStatus !== 'draft') && (
            <div className="text-sm text-gray-700 mb-3 bg-white bg-opacity-60 rounded p-2 border-l-4 border-blue-400">
              <div className="font-medium mb-1">🎓 Application</div>
              {essay.applicationFor && (
                <div className="text-xs mb-1">📍 {essay.applicationFor}</div>
              )}
              {essay.applicationStatus && (
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(essay.applicationStatus)}`}>
                  {essay.applicationStatus.charAt(0).toUpperCase() + essay.applicationStatus.slice(1)}
                </div>
              )}
            </div>
          )}

          {/* Notes Preview */}
          {essay.notes && (
            <div className="text-sm text-gray-700 mb-3 bg-white bg-opacity-60 rounded p-2 border-l-4 border-purple-400">
              <div className="font-medium mb-1">📝 Notes</div>
              <div className="text-xs italic line-clamp-2">{essay.notes}</div>
            </div>
          )}

          {/* Tags */}
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-2">🏷️ Tags:</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {essay.tags.length > 0 ? essay.tags.slice(0, 4).map((tag) => (
                <span 
                  key={tag}
                  className="bg-white bg-opacity-80 text-gray-800 px-2 py-1 rounded-full text-xs font-medium border border-gray-300 shadow-sm"
                >
                  {tag}
                </span>
              )) : (
                <span className="text-gray-600 text-xs italic">No tags yet</span>
              )}
              {essay.tags.length > 4 && (
                <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs">
                  +{essay.tags.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="text-xs text-gray-600 mt-auto pt-2 border-t border-gray-300 border-opacity-50">
            📅 {new Date(essay.lastModified).toLocaleDateString()}
          </div>
        </div>
      ) : (
        /* Back of sticky note - Application, Notes, and Tag management */
        <div className="h-full flex flex-col text-sm">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-base font-bold text-gray-800">✏️ Edit Details</h5>
            <span className="text-xs text-gray-600">Click to flip back</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {/* Application Section */}
            <div className="bg-white bg-opacity-60 rounded p-2 border border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">🎓 Application</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingApplication(!editingApplication);
                    if (!editingApplication) {
                      setTempApplicationFor(essay.applicationFor || "");
                      setTempApplicationStatus(essay.applicationStatus || "draft");
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {editingApplication ? "Cancel" : "Edit"}
                </button>
              </div>
              
              {editingApplication ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Application (e.g., Harvard University)"
                    value={tempApplicationFor}
                    onChange={(e) => setTempApplicationFor(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white"
                  />
                  <select
                    value={tempApplicationStatus}
                    onChange={(e) => setTempApplicationStatus(e.target.value as 'draft' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'not-used')}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="not-used">Not Used</option>
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveApplication();
                    }}
                    className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-700">
                  {essay.applicationFor ? (
                    <div>📍 {essay.applicationFor}</div>
                  ) : (
                    <div className="italic text-gray-500">No application set</div>
                  )}
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(essay.applicationStatus || "draft")}`}>
                    {(essay.applicationStatus || "draft").charAt(0).toUpperCase() + (essay.applicationStatus || "draft").slice(1)}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-white bg-opacity-60 rounded p-2 border border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">📝 Personal Notes</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNotes(!editingNotes);
                    if (!editingNotes) {
                      setTempNotes(essay.notes || "");
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {editingNotes ? "Cancel" : "Edit"}
                </button>
              </div>
              
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    placeholder="Add your notes here..."
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white resize-none"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveNotes();
                    }}
                    className="w-full bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-700 min-h-[2rem]">
                  {essay.notes ? (
                    <div className="italic" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {essay.notes}
                    </div>
                  ) : (
                    <div className="italic text-gray-500">Click Edit to add notes...</div>
                  )}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="bg-white bg-opacity-60 rounded p-2 border border-gray-300">
              <div className="font-medium text-gray-800 mb-2">🏷️ Tags</div>
              <div className="space-y-1 mb-2 max-h-16 overflow-y-auto">
                {essay.tags.length > 0 ? essay.tags.map((tag) => (
                  <div 
                    key={tag}
                    className="flex items-center justify-between bg-white bg-opacity-80 rounded px-2 py-1 border border-gray-300"
                  >
                    <span className="text-xs text-gray-800">{tag}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs ml-1"
                      title="Remove tag"
                    >
                      ✕
                    </button>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 text-xs italic py-1">
                    No tags yet
                  </div>
                )}
              </div>
              
              {/* Add new tag */}
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="New tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleAddTag();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 p-1 border border-gray-300 rounded text-xs bg-white"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTag();
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                >
                  ➕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}