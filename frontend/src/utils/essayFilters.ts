import type { Essay } from '../models/essayModels';

interface FilterOptions {
  searchTerm: string;
  selectedTags: string[];
  tagSearchMode: 'OR' | 'AND';
  minWordCount: string;
  maxWordCount: string;
  minCharCount: string;
  maxCharCount: string;
  selectedApplicationStatus: string;
}

export const filterEssays = (essays: Essay[], filters: FilterOptions): Essay[] => {
  const {
    searchTerm,
    selectedTags,
    tagSearchMode,
    minWordCount,
    maxWordCount,
    minCharCount,
    maxCharCount,
    selectedApplicationStatus
  } = filters;

  return essays.filter(essay => {
    // Search filter
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tag filter
    let matchesTags = true;
    if (selectedTags.length > 0) {
      if (tagSearchMode === 'OR') {
        // OR logic: essay must have at least one of the selected tags
        matchesTags = selectedTags.some(selectedTag => essay.tags.includes(selectedTag));
      } else {
        // AND logic: essay must have all selected tags
        matchesTags = selectedTags.every(selectedTag => essay.tags.includes(selectedTag));
      }
    }
    
    // Word count filter
    const matchesWordCount = (!minWordCount || essay.wordCount >= parseInt(minWordCount)) &&
      (!maxWordCount || essay.wordCount <= parseInt(maxWordCount));
    
    // Character count filter
    const matchesCharCount = (!minCharCount || essay.characterCount >= parseInt(minCharCount)) &&
      (!maxCharCount || essay.characterCount <= parseInt(maxCharCount));
    
    // Application status filter
    const matchesApplicationStatus = !selectedApplicationStatus || essay.applicationStatus === selectedApplicationStatus;
    
    return matchesSearch && matchesTags && matchesWordCount && matchesCharCount && matchesApplicationStatus;
  });
};
