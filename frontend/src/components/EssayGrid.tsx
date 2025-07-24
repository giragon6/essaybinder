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
  return (
    <div 
      className="relative min-h-[800px]" 
      style={{ width: '100%', position: 'relative' }}
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
