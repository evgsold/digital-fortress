'use client';
import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  forumCategoryOperations,
  forumPostOperations,
  forumCommentOperations,
  forumVoteOperations,
  forumReportOperations
} from '@/lib/firebase/database';
import { useUser } from './UserContext';
import type { 
  ForumCategory,
  ForumPost,
  ForumComment,
  ForumVote,
  ForumReport,
  ForumPostWithAuthor,
  ForumCommentWithAuthor
} from '@/types/database';

interface ForumContextType {
  // Categories
  categories: ForumCategory[];
  loadingCategories: boolean;
  
  // Posts
  posts: ForumPost[];
  currentPost: ForumPostWithAuthor | null;
  loadingPosts: boolean;
  loadingCurrentPost: boolean;
  
  // Comments
  comments: ForumCommentWithAuthor[];
  loadingComments: boolean;
  
  // Search & Filters
  searchTerm: string;
  selectedCategory: string | null;
  selectedScamType: string | null;
  selectedSeverity: string | null;
  
  // Operations
  loadCategories: () => Promise<void>;
  loadPosts: (categoryId?: string, limit?: number) => Promise<void>;
  loadPost: (postId: string) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  searchPosts: (term: string, limit?: number) => Promise<void>;
  
  createPost: (postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'viewCount' | 'upvotes' | 'downvotes' | 'commentCount'>) => Promise<string>;
  createComment: (commentData: Omit<ForumComment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'upvotes' | 'downvotes' | 'isHelpful' | 'isModerator'>) => Promise<string>;
  
  voteOnPost: (postId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  voteOnComment: (commentId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  
  reportPost: (postId: string, reason: string, description?: string) => Promise<void>;
  reportComment: (commentId: string, reason: string, description?: string) => Promise<void>;
  
  // Filter setters
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedScamType: (scamType: string | null) => void;
  setSelectedSeverity: (severity: string | null) => void;
  
  // Clear functions
  clearPosts: () => void;
  clearCurrentPost: () => void;
  clearComments: () => void;
}

const ForumContext = createContext<ForumContextType | null>(null);

export const ForumProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUser();
  
  // State
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [currentPost, setCurrentPost] = useState<ForumPostWithAuthor | null>(null);
  const [comments, setComments] = useState<ForumCommentWithAuthor[]>([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingCurrentPost, setLoadingCurrentPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Refs to prevent re-entrant loads without changing hook identities
  const loadingCurrentPostRef = useRef(false);
  const loadingCommentsRef = useRef(false);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedScamType, setSelectedScamType] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  
  // Cache for expensive operations
  const [categoriesCache, setCategoriesCache] = useState<{ data: ForumCategory[], timestamp: number } | null>(null);
  const [postsCache, setPostsCache] = useState<Map<string, { data: ForumPost[], timestamp: number }>>(new Map());
  
  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Memoized categories with caching
  const memoizedCategories = useMemo(() => {
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);
  
  // Memoized posts with filtering
  const memoizedPosts = useMemo(() => {
    let filteredPosts = [...posts];
    
    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(post => post.categoryId === selectedCategory);
    }
    
    if (selectedScamType) {
      filteredPosts = filteredPosts.filter(post => post.scamType === selectedScamType);
    }
    
    if (selectedSeverity) {
      filteredPosts = filteredPosts.filter(post => post.severity === selectedSeverity);
    }
    
    // Sort by pinned first, then by last activity
    return filteredPosts.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });
  }, [posts, selectedCategory, selectedScamType, selectedSeverity]);
  
  // Memoized comments sorted by creation date
  const memoizedComments = useMemo(() => {
    return [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments]);
  
  // Check if cache is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, [CACHE_DURATION]);
  
  // Load categories with caching
  const loadCategories = useCallback(async () => {
    if (loadingCategories) return;
    
    // Check cache first
    if (categoriesCache && isCacheValid(categoriesCache.timestamp)) {
      setCategories(categoriesCache.data);
      return;
    }
    
    try {
      setLoadingCategories(true);
      const categoriesData = await forumCategoryOperations.list();
      setCategories(categoriesData);
      
      // Update cache
      setCategoriesCache({
        data: categoriesData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, [loadingCategories, categoriesCache, isCacheValid]);
  
  // Load posts with caching
  const loadPosts = useCallback(async (categoryId?: string, limit = 20) => {
    if (loadingPosts) return;
    
    const cacheKey = `${categoryId || 'all'}_${limit}`;
    const cachedPosts = postsCache.get(cacheKey);
    
    // Check cache first
    if (cachedPosts && isCacheValid(cachedPosts.timestamp)) {
      setPosts(cachedPosts.data);
      return;
    }
    
    try {
      setLoadingPosts(true);
      const postsData = await forumPostOperations.list(categoryId, limit);
      setPosts(postsData);
      
      // Update cache
      setPostsCache(prev => new Map(prev.set(cacheKey, {
        data: postsData,
        timestamp: Date.now()
      })));
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]); // Ensure posts is set to empty array on error
    } finally {
      setLoadingPosts(false);
    }
  }, [loadingPosts, postsCache, isCacheValid]);
  
  // Load single post with author
  const loadPost = useCallback(async (postId: string) => {
    if (loadingCurrentPostRef.current) return;
    loadingCurrentPostRef.current = true;
    try {
      setLoadingCurrentPost(true);
      const postData = await forumPostOperations.getWithAuthor(postId);
      setCurrentPost(postData);
      
      // Increment view count
      if (postData) {
        await forumPostOperations.incrementViewCount(postId);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoadingCurrentPost(false);
      loadingCurrentPostRef.current = false;
    }
  }, []);
  
  // Load comments for a post
  const loadComments = useCallback(async (postId: string) => {
    if (loadingCommentsRef.current) return;
    loadingCommentsRef.current = true;
    try {
      setLoadingComments(true);
      const commentsData = await forumCommentOperations.getByPost(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
      loadingCommentsRef.current = false;
    }
  }, []);
  
  // Search posts with caching
  const searchPosts = useCallback(async (term: string, limit = 20) => {
    if (loadingPosts) return;
    
    const cacheKey = `search_${term.toLowerCase()}_${limit}`;
    const cachedPosts = postsCache.get(cacheKey);
    
    // Check cache first
    if (cachedPosts && isCacheValid(cachedPosts.timestamp)) {
      setPosts(cachedPosts.data);
      return;
    }
    
    try {
      setLoadingPosts(true);
      const postsData = await forumPostOperations.search(term, limit);
      setPosts(postsData);
      
      // Update cache
      setPostsCache(prev => new Map(prev.set(cacheKey, {
        data: postsData,
        timestamp: Date.now()
      })));
    } catch (error) {
      console.error('Error searching posts:', error);
      setPosts([]); // Ensure posts is set to empty array on error
    } finally {
      setLoadingPosts(false);
    }
  }, [loadingPosts, postsCache, isCacheValid]);
  
  // Create post with cache invalidation
  const createPost = useCallback(async (postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'viewCount' | 'upvotes' | 'downvotes' | 'commentCount'>) => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const now = new Date().toISOString();
    const fullPostData = {
      ...postData,
      authorId: currentUser.userId,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      viewCount: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0
    };
    
    const newPost = await forumPostOperations.create(fullPostData);
    
    // Invalidate posts cache since new post was created
    setPostsCache(new Map());
    
    return newPost.id;
  }, [currentUser]);
  
  // Create comment with cache invalidation
  const createComment = useCallback(async (commentData: Omit<ForumComment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'upvotes' | 'downvotes' | 'isHelpful' | 'isModerator'>) => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const now = new Date().toISOString();
    const fullCommentData = {
      ...commentData,
      authorId: currentUser.userId,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
      upvotes: 0,
      downvotes: 0,
      isHelpful: false,
      isModerator: currentUser.role === 'admin'
    };
    
    const newComment = await forumCommentOperations.create(fullCommentData);
    
    // Invalidate posts cache since comment count changed
    setPostsCache(new Map());
    
    // Refresh comments after creating
    await loadComments(commentData.postId);
    
    return newComment.id;
  }, [currentUser, loadComments]);
  
  // Vote on post with cache invalidation
  const voteOnPost = useCallback(async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const voteData = {
      userId: currentUser.userId,
      targetId: postId,
      targetType: 'post' as const,
      voteType,
      createdAt: new Date().toISOString()
    };
    
    await forumVoteOperations.create(voteData);
    
    // Invalidate posts cache since vote counts changed
    setPostsCache(new Map());
    
    // Refresh current post if it's the one being voted on
    if (currentPost && currentPost.id === postId) {
      await loadPost(postId);
    }
    
    // Refresh posts list
    await loadPosts(selectedCategory || undefined);
  }, [currentUser, currentPost, selectedCategory, loadPost, loadPosts]);
  
  // Vote on comment
  const voteOnComment = useCallback(async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const voteData = {
      userId: currentUser.userId,
      targetId: commentId,
      targetType: 'comment' as const,
      voteType,
      createdAt: new Date().toISOString()
    };
    
    await forumVoteOperations.create(voteData);
    
    // Refresh comments
    if (currentPost) {
      await loadComments(currentPost.id);
    }
  }, [currentUser, currentPost, loadComments]);
  
  // Report post
  const reportPost = useCallback(async (postId: string, reason: string, description?: string) => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const reportData = {
      reporterId: currentUser.userId,
      targetId: postId,
      targetType: 'post' as const,
      reason: reason as any,
      description,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    await forumReportOperations.create(reportData);
  }, [currentUser]);
  
  // Report comment
  const reportComment = useCallback(async (commentId: string, reason: string, description?: string) => {
    if (!currentUser) throw new Error('User must be logged in');
    
    const reportData = {
      reporterId: currentUser.userId,
      targetId: commentId,
      targetType: 'comment' as const,
      reason: reason as any,
      description,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    await forumReportOperations.create(reportData);
  }, [currentUser]);
  
  // Clear functions
  const clearPosts = useCallback(() => setPosts([]), []);
  const clearCurrentPost = useCallback(() => setCurrentPost(null), []);
  const clearComments = useCallback(() => setComments([]), []);
  
  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  
  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Categories (memoized)
    categories: memoizedCategories,
    loadingCategories,
    
    // Posts (memoized and filtered)
    posts: memoizedPosts,
    currentPost,
    loadingPosts,
    loadingCurrentPost,
    
    // Comments (memoized and sorted)
    comments: memoizedComments,
    loadingComments,
    
    // Search & Filters
    searchTerm,
    selectedCategory,
    selectedScamType,
    selectedSeverity,
    
    // Operations
    loadCategories,
    loadPosts,
    loadPost,
    loadComments,
    searchPosts,
    createPost,
    createComment,
    voteOnPost,
    voteOnComment,
    reportPost,
    reportComment,
    
    // Filter setters
    setSearchTerm,
    setSelectedCategory,
    setSelectedScamType,
    setSelectedSeverity,
    
    // Clear functions
    clearPosts,
    clearCurrentPost,
    clearComments
  }), [
    memoizedCategories,
    loadingCategories,
    memoizedPosts,
    currentPost,
    loadingPosts,
    loadingCurrentPost,
    memoizedComments,
    loadingComments,
    searchTerm,
    selectedCategory,
    selectedScamType,
    selectedSeverity,
    loadCategories,
    loadPosts,
    loadPost,
    loadComments,
    searchPosts,
    createPost,
    createComment,
    voteOnPost,
    voteOnComment,
    reportPost,
    reportComment,
    setSearchTerm,
    setSelectedCategory,
    setSelectedScamType,
    setSelectedSeverity,
    clearPosts,
    clearCurrentPost,
    clearComments
  ]);
  
  return (
    <ForumContext.Provider value={contextValue}>
      {children}
    </ForumContext.Provider>
  );
};

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};
