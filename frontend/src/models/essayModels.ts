interface DriveLabel {
  labelId: string;
  fieldId?: string;
  value: string;
  type: 'custom' | 'builtin';
}

interface Essay {
  id: string;
  title: string;
  content: string;
  characterCount: number;
  wordCount: number;
  driveLabels: DriveLabel[];
  tags: string[];  // New field for tags
  createdDate: string;
  lastModified: string;
  googleDocId: string;
  addedVia: 'url' | 'file-picker';
  dateAdded: string;
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
  onRemoveEssay: (essayId: string) => void;
}

export type { Essay, UserProfile, EssayCardProps, DriveLabel };