interface Essay {
  id: string;
  title: string;
  characterCount: number;
  wordCount: number;
  tags: string[];
  createdDate: string;
  lastModified: string;
  googleDocId: string;
  applicationFor?: string; // e.g., "Harvard University", "MIT Summer Program", etc.
  applicationStatus?: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'not-used';
  notes?: string; // User's personal notes about the essay
}

interface EssayPosition {
  x: number;
  y: number;
  zIndex?: number;
}

interface UserPositions {
  [essayId: string]: EssayPosition;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface EssayCardProps {
  essay: Essay;
  onAddTag: (essayId: string, tag: string) => void;
  onRemoveTag: (essayId: string, tag: string) => void;
  onUpdateApplication: (essayId: string, applicationFor: string, applicationStatus: string) => void;
  onUpdateNotes: (essayId: string, notes: string) => void;
  onPositionChange: (essayId: string, position: EssayPosition) => void;
}

export type { Essay, EssayPosition, UserPositions, UserProfile, EssayCardProps };