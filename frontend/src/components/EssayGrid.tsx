import { useEffect, useState } from "react";
import EssayCard from "./EssayCard";
import type { Essay, EssayPosition } from "../models/essayModels";

interface EssayGridProps {
  essays: Essay[];
  essayPositions: Record<string, EssayPosition>;
  getDefaultPosition: (index: number) => EssayPosition;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onAddTag: (essayId: string, tag: string) => void;
  onRemoveTag: (essayId: string, tag: string) => void;
  onUpdateApplication: (essayId: string, applicationFor: string, applicationStatus: string) => void;
  onUpdateNotes: (essayId: string, notes: string) => void;
  onPositionChange: (essayId: string, position: EssayPosition) => void;
}

export default function EssayGrid({
  essays,
  essayPositions,
  getDefaultPosition,
  onDrop,
  onDragOver,
  onAddTag,
  onRemoveTag,
  onUpdateApplication,
  onUpdateNotes,
  onPositionChange
}: EssayGridProps) {
  const [dynamicHeight, setDynamicHeight] = useState<number>(800);
  
  useEffect(() => {
    if (essays.length === 0) {
      setDynamicHeight(800); 
      return;
    }
    
    let maxBottom = 0;
    essays.forEach((essay, index) => {
      const position = essayPositions[essay.id] || getDefaultPosition(index);
      const estimatedCardHeight = 300; 
      const cardBottom = position.y + estimatedCardHeight;
      maxBottom = Math.max(maxBottom, cardBottom);
    });
    
    // Add extra space for new essays (at least 400px padding at bottom)
    const minHeight = 800;
    const paddingHeight = 400;
    const calculatedHeight = Math.max(minHeight, maxBottom + paddingHeight);
    setDynamicHeight(calculatedHeight);
  }, [essays, essayPositions, getDefaultPosition]);

  return (
    <div 
      className="relative" 
      style={{ 
        width: '100%', 
        position: 'relative',
        minHeight: `${dynamicHeight}px`,
        // Add a subtle grid pattern to help with positioning
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)
        `,
        backgroundSize: '40px 40px'
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {essays.map((essay, index) => {
        const position = essayPositions[essay.id] || getDefaultPosition(index);
        return (
          <div
            key={essay.id}
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y,
              zIndex: position.zIndex || 1
            }}
          >
            <EssayCard 
              essay={essay} 
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onUpdateApplication={onUpdateApplication}
              onUpdateNotes={onUpdateNotes}
              onPositionChange={onPositionChange}
            />
          </div>
        );
      })}
    </div>
  );
}
