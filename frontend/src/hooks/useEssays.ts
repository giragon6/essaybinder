import { useState, useCallback } from 'react';
import type { Essay } from '../models/essayModels';

export const useEssays = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingEssay, setAddingEssay] = useState(false);
  const [newDocUrl, setNewDocUrl] = useState("");

  const fetchEssays = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEssays(data.essays || []);
      }
    } catch (error) {
      console.error("Error fetching essays:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEssayByUrl = useCallback(async () => {
    if (!newDocUrl.trim()) return;
    setAddingEssay(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ url: newDocUrl.trim() }) 
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewDocUrl("");
        fetchEssays(); 
        alert("Essay added successfully!");
      } else {
        alert(data.error || "Failed to add essay");
      }
    } catch (error) {
      console.error("Error adding essay:", error);
      alert("Failed to add essay");
    } finally {
      setAddingEssay(false);
    }
  }, [newDocUrl, fetchEssays]);

  const removeEssay = useCallback(async (essayId: string) => {
    if (!confirm("Remove this essay from your catalog? This won't delete the Google Doc.")) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/${essayId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchEssays();
      } else {
        alert("Failed to remove essay");
      }
    } catch (error) {
      console.error("Error removing essay:", error);
      alert("Failed to remove essay");
    }
  }, [fetchEssays]);

  const addTagToEssay = useCallback(async (essayId: string, tag: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/${essayId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ tag })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  }, [fetchEssays]);

  const removeTagFromEssay = useCallback(async (essayId: string, tag: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/${essayId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ tag })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  }, [fetchEssays]);

  const updateEssayApplication = useCallback(async (essayId: string, applicationFor: string, applicationStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/${essayId}/application`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ applicationFor, applicationStatus })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error updating essay application:", error);
    }
  }, [fetchEssays]);

  const updateEssayNotes = useCallback(async (essayId: string, notes: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/essays/${essayId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        fetchEssays();
      }
    } catch (error) {
      console.error("Error updating essay notes:", error);
    }
  }, [fetchEssays]);

  return {
    essays,
    loading,
    addingEssay,
    newDocUrl,
    setNewDocUrl,
    fetchEssays,
    addEssayByUrl,
    removeEssay,
    addTagToEssay,
    removeTagFromEssay,
    updateEssayApplication,
    updateEssayNotes
  };
};
