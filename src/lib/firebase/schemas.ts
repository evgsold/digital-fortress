import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  avatarUrl: z.string().optional(),
  avatarStoragePath: z.string().optional(),
  createdAt: z.string(),
  role: z.enum(['admin', 'user']),
  settings: z.object({
    language: z.string(),
    notifications: z.boolean()
  })
});

// Forum Category Schema
export const forumCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean().default(true)
});

// Forum Post Schema
export const forumPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  authorId: z.string(),
  categoryId: z.string(),
  scamType: z.enum([
    'phishing',
    'social_engineering',
    'fake_websites',
    'phone_scams',
    'email_scams',
    'investment_fraud',
    'romance_scams',
    'tech_support_scams',
    'cryptocurrency_scams',
    'identity_theft',
    'other'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    size: z.number(),
    type: z.string()
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  isResolved: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  viewCount: z.number().default(0),
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
  commentCount: z.number().default(0),
  lastActivityAt: z.string()
});

// Forum Comment Schema
export const forumCommentSchema = z.object({
  postId: z.string(),
  authorId: z.string(),
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
  attachments: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    size: z.number(),
    type: z.string()
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  isEdited: z.boolean().default(false),
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
  isHelpful: z.boolean().default(false),
  isModerator: z.boolean().default(false)
});

// Forum Vote Schema
export const forumVoteSchema = z.object({
  userId: z.string(),
  targetId: z.string(), // postId or commentId
  targetType: z.enum(['post', 'comment']),
  voteType: z.enum(['upvote', 'downvote']),
  createdAt: z.string()
});

// Forum Report Schema
export const forumReportSchema = z.object({
  reporterId: z.string(),
  targetId: z.string(),
  targetType: z.enum(['post', 'comment']),
  reason: z.enum([
    'spam',
    'inappropriate_content',
    'harassment',
    'misinformation',
    'off_topic',
    'duplicate',
    'other'
  ]),
  description: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).default('pending'),
  createdAt: z.string(),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  moderatorNotes: z.string().optional()
});

export const blogAuthorSchema = z.object({
  name: z.string().min(2),
  avatar: z.string().url().optional(),
  role: z.string().optional(),
  bio: z.string().optional(),
  social: z.object({
    instagram: z.string().url().optional(),
    telegram: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

export const blogCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.array(z.any()),
  authorId: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  readTime: z.number().int().positive(),
  categoryId: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  featured: z.boolean(),
  status: z.enum(['published', 'draft']),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export const gameScenarioSchema = z.object({
  // Описание ситуации, которое видит пользователь
  description: z.string().min(10, "Описание должно содержать не менее 10 символов"),
  
  // Является ли ситуация мошенничеством
  isScam: z.boolean(),
  
  // Объяснение, если пользователь выбрал "Да, это мошенники"
  explanationForScam: z.string().min(10, "Объяснение должно содержать не менее 10 символов"),
  
  // Объяснение, если пользователь выбрал "Нет, это не мошенники"
  explanationForNotScam: z.string().min(10, "Объяснение должно содержать не менее 10 символов"),
});

// Схема для игровой сессии
export const gameSessionSchema = z.object({
  // ID пользователя, который играет
  userId: z.string(),
  
  // Массив ID сценариев для этой сессии
  scenarioIds: z.array(z.string()).nonempty("В сессии должен быть хотя бы один сценарий"),
  
  // Индекс текущего сценария в массиве
  currentScenarioIndex: z.number().int().nonnegative().default(0),
  
  // Текущий счет игрока
  score: z.number().int().nonnegative().default(0),
  
  // Статус сессии
  status: z.enum(['in-progress', 'completed']).default('in-progress'),
  
  // Дата создания
  createdAt: z.string(),
  
  // Дата последнего обновления
  updatedAt: z.string(),
});

// Схема для ответа пользователя
export const userAnswerSchema = z.object({
  // ID сессии, к которой относится ответ
  sessionId: z.string(),
  
  // ID сценария, на который дан ответ
  scenarioId: z.string(),
  
  // ID пользователя
  userId: z.string(),
  
  // Ответ пользователя (true - думает, что это мошенничество)
  userGuess: z.boolean(),
  
  // Был ли ответ правильным
  isCorrect: z.boolean(),
  
  // Дата ответа
  answeredAt: z.string(),
});