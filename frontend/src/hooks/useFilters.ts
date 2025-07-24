import { useState, useCallback } from 'react';

export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchMode, setTagSearchMode] = useState<'OR' | 'AND'>('OR');
  const [minWordCount, setMinWordCount] = useState("");
  const [maxWordCount, setMaxWordCount] = useState("");
  const [minCharCount, setMinCharCount] = useState("");
  const [maxCharCount, setMaxCharCount] = useState("");
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState("");

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTags([]);
    setTagSearchMode('OR');
    setMinWordCount("");
    setMaxWordCount("");
    setMinCharCount("");
    setMaxCharCount("");
    setSelectedApplicationStatus("");
  }, []);

  return {
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
    resetFilters
  };
};
