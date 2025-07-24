interface Essay {
  id: string;
  title: string;
  content: string;
  characterCount: number;
  wordCount: number;
  tags: string[];
  theme?: string;
  createdDate: string;
  lastModified: string;
  googleDocId: string;
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
  onRemoveEssay: (essayId: string) => void;
}

export type { Essay, UserProfile, EssayCardProps };