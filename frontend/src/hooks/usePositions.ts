import { useState, useCallback } from 'react';
import type { UserPositions, EssayPosition } from '../models/essayModels';

export const usePositions = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [essayPositions, setEssayPositions] = useState<UserPositions>({});
  const [hasUnsavedPositions, setHasUnsavedPositions] = useState(false);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/positions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEssayPositions(data.positions || {});
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  }, []);

  const savePositions = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/positions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ positions: essayPositions })
      });
      
      if (response.ok) {
        setHasUnsavedPositions(false);
        alert('Positions saved successfully!');
      } else {
        alert('Failed to save positions');
      }
    } catch (error) {
      console.error("Error saving positions:", error);
      alert('Failed to save positions');
    }
  }, [essayPositions]);

  const handlePositionChange = useCallback((essayId: string, position: EssayPosition) => {
    setEssayPositions(prev => ({
      ...prev,
      [essayId]: position
    }));
    setHasUnsavedPositions(true);
  }, []);

  const getDefaultPosition = useCallback((index: number): EssayPosition => {
    const cols = 4;
    const cardWidth = 300;
    const cardHeight = 350;
    const marginX = 20;
    const marginY = 20;
    
    return {
      x: (index % cols) * (cardWidth + marginX),
      y: Math.floor(index / cols) * (cardHeight + marginY),
      zIndex: 1
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const essayData = e.dataTransfer.getData('application/essay-card');
    if (essayData) {
      try {
        const { essayId, offsetX, offsetY } = JSON.parse(essayData);
        const container = e.currentTarget.getBoundingClientRect();
        
        const newPosition: EssayPosition = {
          x: e.clientX - container.left - offsetX,
          y: e.clientY - container.top - offsetY,
          zIndex: 1
        };
        
        handlePositionChange(essayId, newPosition);
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  }, [handlePositionChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const clearPositions = useCallback(() => {
    setEssayPositions({});
    setHasUnsavedPositions(false);
  }, []);

  return {
    essayPositions,
    hasUnsavedPositions,
    fetchPositions,
    savePositions,
    handlePositionChange,
    getDefaultPosition,
    handleDrop,
    handleDragOver,
    clearPositions
  };
};
