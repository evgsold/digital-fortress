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

// Forum Types
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

// Extended types with populated data
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

// --- Определения для каждого типа контентного блока ---

/**
 * Блок для обычного текстового абзаца.
 */
export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
}

/**
 * Блок для заголовков разных уровней (H2, H3, H4).
 */
export interface HeadingBlock {
  type: 'heading';
  level: 2 | 3 | 4;
  content: string;
}

/**
 * Блок для маркированного списка.
 */
export interface ListBlock {
  type: 'list';
  items: string[];
}

/**
 * Блок для пошаговых инструкций.
 */
export interface StepsBlock {
  type: 'steps';
  steps: string[];
}

/**
 * Блок для выделения советов или важных заметок.
 */
export interface TipBlock {
  type: 'tip';
  title: string;
  content: string;
  color: BlockColor;
}

/**
 * Информационный блок с заголовком и списком пунктов.
 */
export interface InfoBoxBlock {
  type: 'infoBox';
  title: string;
  items: string[];
  color: BlockColor;
}

/**
 * Блок для обзора продукта с рейтингом.
 */
export interface ProductRatingBlock {
  type: 'productRating';
  name: string;
  rating: string; // Например, "9/10"
  description: string;
  color: BlockColor;
}