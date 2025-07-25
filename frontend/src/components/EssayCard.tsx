import { useState } from "react";
import type { EssayCardProps } from "../models/essayModels";
import { getTagStickerClasses } from "../utils/tagColors";
import "./StickyNote.css";

export default function EssayCard({ essay, onAddTag, onRemoveTag, onUpdateApplication, onUpdateNotes }: EssayCardProps) {
  const [newTag, setNewTag] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(essay.notes || "");
  const [editingApplication, setEditingApplication] = useState(false);
  const [tempApplicationFor, setTempApplicationFor] = useState(essay.applicationFor || "");
  const [tempApplicationStatus, setTempApplicationStatus] = useState<'draft' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'not-used'>(essay.applicationStatus || "draft");
  const [isDragging, setIsDragging] = useState(false);

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

  const colors = [
    'bg-yellow-200 border-yellow-300',
    'bg-pink-200 border-pink-300', 
    'bg-blue-200 border-blue-300',
    'bg-green-200 border-green-300',
    'bg-purple-200 border-purple-300',
    'bg-orange-200 border-orange-300'
  ];
  
  const colorIndex = essay.id.charCodeAt(essay.id.length - 1) % colors.length;
  const stickyColor = colors[colorIndex];

  const thumbtackColors = [
    { bg: 'bg-red-500', border: 'border-red-600', inner: 'bg-red-700' },
    { bg: 'bg-blue-500', border: 'border-blue-600', inner: 'bg-blue-700' },
    { bg: 'bg-green-500', border: 'border-green-600', inner: 'bg-green-700' },
    { bg: 'bg-purple-500', border: 'border-purple-600', inner: 'bg-purple-700' },
    { bg: 'bg-orange-500', border: 'border-orange-600', inner: 'bg-orange-700' },
    { bg: 'bg-pink-500', border: 'border-pink-600', inner: 'bg-pink-700' },
  ];
  
  const thumbtackColorIndex = Math.floor(Math.random() * thumbtackColors.length);
  const thumbtackColor = thumbtackColors[thumbtackColorIndex];

  return (
    <div className="square">
      <div 
        className={`relative group ${stickyColor} p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 mx-auto cursor-move sticky-note sticky-note-shadow`}
        style={{
          transform: `rotate(${Math.random() * 6 - 3}deg)`
        }}
        draggable={true}
        onDragStart={(e) => {
          setIsDragging(true);
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          
          e.dataTransfer.setData('text/plain', essay.id);
          e.dataTransfer.setData('application/essay-card', JSON.stringify({
            essayId: essay.id,
            offsetX,
            offsetY
          }));
          e.dataTransfer.effectAllowed = 'move';
          e.currentTarget.style.opacity = '0.5';
          e.currentTarget.style.transform = 'scale(0.95) rotate(5deg)';
        }}
        onDragEnd={(e) => {
          setIsDragging(false);
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = '';
        }}
        onClick={() => !isDragging && setIsFlipped(!isFlipped)}
      >
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`w-4 h-4 ${thumbtackColor.bg} rounded-full shadow-lg border-2 ${thumbtackColor.border} relative`}>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 ${thumbtackColor.inner} rounded-full`}></div>
          </div>
        </div>

        {!isFlipped ? (
          <div className="h-full flex flex-col">
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

            <div className="flex-1 my-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {essay.tags.length > 0 ? essay.tags.slice(0, 4).map((tag) => (
                  <span 
                    key={tag}
                    className={getTagStickerClasses(tag)}
                  >
                    {tag}
                  </span>
                )) : (
                  <span className="text-gray-600 text-xs italic">No tags yet</span>
                )}
                {essay.tags.length > 4 && (
                  <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-gray shadow-lg">
                    +{essay.tags.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {(essay.applicationFor || essay.applicationStatus !== 'draft') && (
              <div className="text-sm text-gray-700 my-3">
                Written for:
                {essay.applicationFor && (
                  <span> {essay.applicationFor}</span>
                )}
                {essay.applicationStatus && (
                  <span className={`text-${getStatusColor(essay.applicationStatus)}`}> ({essay.applicationStatus.charAt(0).toUpperCase() + essay.applicationStatus.slice(1)})</span>
                )}
              </div>
            )}

            {essay.notes && (
              <div className="text-sm text-gray-700 my-3">
                <div className="font-medium mb-1">Notes</div>
                <div className="text-xs italic line-clamp-2">{essay.notes}</div>
              </div>
            )}

            <div className="text-xs text-gray-600 mt-auto pt-2 border-t border-gray-300 border-opacity-50">
              <div className="flex justify-between items-center w-full">
                <span className="text-left flex-1">{new Date(essay.lastModified).toLocaleDateString()}</span>
                <span className="text-center flex-1">{essay.wordCount.toLocaleString()} words</span>
                <span className="text-right flex-1">{essay.characterCount.toLocaleString()} characters</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col text-sm ">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-base font-bold text-gray-800">Edit Details</h5>
              <span className="text-xs text-gray-600">Click to flip back</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
              <div className="">
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
                      <div>Written for: {essay.applicationFor}</div>
                    ) : (
                      <div className="italic text-gray-500">No application set</div>
                    )}
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(essay.applicationStatus || "draft")}`}>
                      {(essay.applicationStatus || "draft").charAt(0).toUpperCase() + (essay.applicationStatus || "draft").slice(1)}
                    </div>
                  </div>
                )}
              </div>

              <div className="">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">Personal Notes</span>
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
                      className="w-full p-1 border border-gray-300 rounded text-xs bg-white resize-none "
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
                      <div className="italic ">
                        {essay.notes}
                      </div>
                    ) : (
                      <div className="italic text-gray-500">Click Edit to add notes...</div>
                    )}
                  </div>
                )}
              </div>

               <div className="">
                <div className="font-medium text-gray-800 mb-2">Tags</div>
                <div className="space-y-1 mb-2 max-h-16 overflow-y-auto scrollbar-hide">
                  {essay.tags.length > 0 ? essay.tags.map((tag) => (
                    <div 
                      key={tag}
                      className={`${getTagStickerClasses(tag)} flex items-center justify-between group cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                    >
                      <span className="text-xs">{tag}</span>
                      <button
                        className="text-white opacity-60 hover:opacity-100 text-xs ml-1 transition-opacity"
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
                
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="New tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        handleAddTag();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full p-3 text-gray-500 !border-none !outline-none !focus:outline-none !focus:ring-0 !bg-transparent !focus:bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}