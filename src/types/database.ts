export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  avatarUrl: string;
  avatarStoragePath: string;
  role: 'admin' | 'user';
  settings: {
    language: string;
    notifications: boolean;
  };
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  scamType: 'phishing' | 'social_engineering' | 'fake_websites' | 'phone_scams' | 'email_scams' | 'investment_fraud' | 'romance_scams' | 'tech_support_scams' | 'cryptocurrency_scams' | 'identity_theft' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  attachments: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  lastActivityAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  attachments: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  upvotes: number;
  downvotes: number;
  isHelpful: boolean;
  isModerator: boolean;
}

export interface ForumVote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface ForumReport {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  reason: 'spam' | 'inappropriate_content' | 'harassment' | 'misinformation' | 'off_topic' | 'duplicate' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moderatorNotes?: string;
}

export interface ForumPostWithAuthor extends ForumPost {
  author: User;
  category: ForumCategory;
}

export interface ForumCommentWithAuthor extends ForumComment {
  author: User;
  replies?: ForumCommentWithAuthor[];
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  bio?: string;
  social?: {
    instagram?: string;
    telegram?: string;
    website?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export type BlogPostStatus = 'published' | 'draft';

export interface BlogPostSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any[];
  authorId: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  categoryId: string;
  tags: string[];
  image: string;
  featured: boolean;
  status: BlogPostStatus;
  seo?: BlogPostSEO;
}

export type BlockColor = 
  | 'gray' 
  | 'rose' 
  | 'pink' 
  | 'purple' 
  | 'indigo' 
  | 'blue' 
  | 'green' 
  | 'yellow';

export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
}

export interface HeadingBlock {
  type: 'heading';
  level: 2 | 3 | 4;
  content: string;
}

export interface ListBlock {
  type: 'list';
  items: string[];
}

export interface StepsBlock {
  type: 'steps';
  steps: string[];
}

export interface TipBlock {
  type: 'tip';
  title: string;
  content: string;
  color: BlockColor;
}

export interface InfoBoxBlock {
  type: 'infoBox';
  title: string;
  items: string[];
  color: BlockColor;
}

export interface ProductRatingBlock {
  type: 'productRating';
  name: string;
  rating: string;
  description: string;
  color: BlockColor;
}

export type BlogPostBlock = ParagraphBlock | HeadingBlock | ListBlock | StepsBlock | TipBlock | InfoBoxBlock | ProductRatingBlock;

// Описывает один игровой сценарий или ситуацию
export interface GameScenario {
  id: string;
  // Текст ситуации, который показывается игроку
  description: string;
  // Правильный ответ: true, если это мошенничество, false - если нет
  isScam: boolean;
  // Объяснение, которое показывается, если пользователь ответил "Да, это мошенники"
  explanationForScam: string;
  // Объяснение, которое показывается, если пользователь ответил "Нет, это не мошенники"
  explanationForNotScam: string;
  // Категория вопроса
  category: string;
}

// Описывает игровую сессию конкретного пользователя
export interface GameSession {
  id: string;
  userId: string;
  // Массив ID сценариев, которые будут в этой игре
  scenarioIds: string[];
  // Индекс текущего вопроса в массиве scenarioIds
  currentScenarioIndex: number;
  // Количество правильных ответов
  score: number;
  // Статус игры: 'in-progress' (в процессе) или 'completed' (завершена)
  status: 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Ответ пользователя на конкретный сценарий в рамках сессии
export interface UserAnswer {
  id: string;
  sessionId: string;
  scenarioId: string;
  userId: string;
  // Ответ пользователя (true - считает, что это мошенничество)
  userGuess: boolean;
  // Был ли ответ правильным
  isCorrect: boolean;
  answeredAt: string;
}