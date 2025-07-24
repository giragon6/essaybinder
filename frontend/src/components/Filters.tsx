import { useState } from "react";

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  tagSearchMode: 'OR' | 'AND';
  setTagSearchMode: (mode: 'OR' | 'AND') => void;
  minWordCount: number | string;
  setMinWordCount: (count: string) => void;
  maxWordCount: number | string;
  setMaxWordCount: (count: string) => void;
  minCharCount: number | string;
  setMinCharCount: (count: string) => void;
  maxCharCount: number | string;
  setMaxCharCount: (count: string) => void;
  selectedApplicationStatus: string;
  setSelectedApplicationStatus: (status: string) => void;
  allTags: string[];
}

export function Filters(props: FiltersProps ) {
  const [showFilters, setShowFilters] = useState(false);
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setMinWordCount("");
    setMaxWordCount("");
    setMinCharCount("");
    setMaxCharCount("");
    setSelectedApplicationStatus("");
  };
  
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
    setSelectedApplicationStatus,
    allTags
  } = props;

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {/* Tape roll on the left */}
          <div 
            className={`tape-roll ${showFilters ? 'spinning' : ''} tape-roll-size flex-shrink-0`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="tape-roll-label">
              {showFilters ? 'Close' : 'Filters'}
            </div>
          </div>

          {/* Active filters to the right */}
          <div className={`active-filters flex-grow ${!searchTerm && selectedTags.length === 0 && !minWordCount && !maxWordCount && !minCharCount && !maxCharCount && !selectedApplicationStatus ? 'empty' : ''}`}>
            {searchTerm && (
              <div className="tape-piece new-tape">
                🔎 "{searchTerm}"
                <span className="remove-tape" onClick={() => setSearchTerm("")}>×</span>
              </div>
            )}
            {selectedTags.map(tag => (
              <div key={tag} className="tape-piece new-tape">
                🏷️ {tag}
                <span className="remove-tape" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}>×</span>
              </div>
            ))}
            {selectedTags.length > 1 && (
              <div className="tape-piece new-tape">
                🔗 {tagSearchMode} mode
                <span className="remove-tape" onClick={() => setTagSearchMode(tagSearchMode === 'OR' ? 'AND' : 'OR')}>⇄</span>
              </div>
            )}
            {selectedApplicationStatus && (
              <div className="tape-piece new-tape">
                🎓 {selectedApplicationStatus.charAt(0).toUpperCase() + selectedApplicationStatus.slice(1)}
                <span className="remove-tape" onClick={() => setSelectedApplicationStatus("")}>×</span>
              </div>
            )}
            {(minWordCount || maxWordCount) && (
              <div className="tape-piece new-tape">
                📊 Words: {minWordCount || '0'}-{maxWordCount || '∞'}
                <span className="remove-tape" onClick={() => { setMinWordCount(""); setMaxWordCount(""); }}>×</span>
              </div>
            )}
            {(minCharCount || maxCharCount) && (
              <div className="tape-piece new-tape">
                🔤 Chars: {minCharCount || '0'}-{maxCharCount || '∞'}
                <span className="remove-tape" onClick={() => { setMinCharCount(""); setMaxCharCount(""); }}>×</span>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="tape-menu">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 ">
                🔎 Search Essays
              </label>
              <input
                type="text"
                placeholder="Search by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-amber-600 rounded-lg bg-white placeholder-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all "
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 ">
                🎓 Filter by Application Status
              </label>
              <select
                value={selectedApplicationStatus}
                onChange={(e) => setSelectedApplicationStatus(e.target.value)}
                className="w-full p-3 border-2 border-amber-600 rounded bg-white "
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="not-used">Not Used</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 ">
                  🏷️ Filter by Tags
                </label>
                {selectedTags.length > 1 && (
                  <button
                    onClick={() => setTagSearchMode(tagSearchMode === 'OR' ? 'AND' : 'OR')}
                    className={`px-3 py-1 text-sm rounded-lg  transition-all transform hover:scale-105 ${
                      tagSearchMode === 'OR' 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-2 border-purple-300'
                    }`}
                    title={tagSearchMode === 'OR' ? 'Show essays with ANY selected tag' : 'Show essays with ALL selected tags'}
                  >
                    {tagSearchMode === 'OR' ? '🔗 Any tag (OR)' : '🔒 All tags (AND)'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50 bg-opacity-50">
                {Array.from(new Set(allTags)).sort().map(tag => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-amber-100 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        }
                      }}
                      className="w-4 h-4 text-amber-600 border-2 border-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm  truncate">{tag}</span>
                  </label>
                ))}
                {allTags.length === 0 && (
                  <p className="text-sm text-gray-500  italic col-span-full text-center py-4">No tags available</p>
                )}
              </div>
            </div>

            {/* Word and Character Count Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 ">
                   Word Count Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minWordCount}
                    onChange={(e) => setMinWordCount(e.target.value)}
                    className="w-1/2 p-2 border-2 border-amber-600 rounded "
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxWordCount}
                    onChange={(e) => setMaxWordCount(e.target.value)}
                    className="w-1/2 p-2 border-2 border-amber-600 rounded "
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 ">
                  🔤 Character Count Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minCharCount}
                    onChange={(e) => setMinCharCount(e.target.value)}
                    className="w-1/2 p-2 border-2 border-amber-600 rounded "
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxCharCount}
                    onChange={(e) => setMaxCharCount(e.target.value)}
                    className="w-1/2 p-2 border-2 border-amber-600 rounded "
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg transition-all transform hover:scale-105 text-white bg-gray-500 "
              >
                🗑️ Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}