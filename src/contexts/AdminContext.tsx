'use client';
import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { 
  userOperations,
  forumCategoryOperations,
  forumPostOperations,
  forumCommentOperations,
  forumReportOperations
} from '@/lib/firebase/database';
import { useUser } from './UserContext';
import type { 
  User,
  ForumCategory,
  ForumPost,
  ForumComment,
  ForumReport,
  ForumPostWithAuthor,
  ForumCommentWithAuthor
} from '@/types/database';

interface AdminContextType {
  // Users
  users: User[];
  loadingUsers: boolean;
  
  // Categories
  categories: ForumCategory[];
  loadingCategories: boolean;
  
  // Posts
  posts: ForumPost[];
  loadingPosts: boolean;
  
  // Comments
  comments: ForumComment[];
  loadingComments: boolean;
  
  // Reports
  reports: ForumReport[];
  loadingReports: boolean;
  
  // User operations
  loadUsers: () => Promise<void>;
  createUser: (userId: string, userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Category operations
  loadCategories: () => Promise<void>;
  createCategory: (categoryData: Omit<ForumCategory, 'id'>) => Promise<void>;
  updateCategory: (categoryId: string, categoryData: Partial<ForumCategory>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  
  // Post operations
  loadPosts: () => Promise<void>;
  createPost: (postData: Omit<ForumPost, 'id'>) => Promise<void>;
  updatePost: (postId: string, postData: Partial<ForumPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Comment operations
  loadComments: () => Promise<void>;
  updateComment: (commentId: string, commentData: Partial<ForumComment>) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Report operations
  loadReports: () => Promise<void>;
  updateReport: (reportId: string, reportData: Partial<ForumReport>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface AdminCache {
  users: CacheEntry<User[]> | null;
  categories: CacheEntry<ForumCategory[]> | null;
  posts: CacheEntry<ForumPost[]> | null;
  comments: CacheEntry<ForumComment[]> | null;
  reports: CacheEntry<ForumReport[]> | null;
}

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUser();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [reports, setReports] = useState<ForumReport[]>([]);
  
  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Cache and refs
  const cacheRef = useRef<AdminCache>({
    users: null,
    categories: null,
    posts: null,
    comments: null,
    reports: null
  });
  
  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Check if user is admin
  const isAdmin = useMemo(() => currentUser?.role === 'admin', [currentUser?.role]);
  
  // Cache validation helper
  const isCacheValid = useCallback((cacheEntry: CacheEntry<any> | null): boolean => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
  }, [CACHE_DURATION]);
  
  // Cache update helper
  const updateCache = useCallback((key: keyof AdminCache, data: any) => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    } as any;
  }, []);
  
  // Cache invalidation helper
  const invalidateCache = useCallback((keys?: (keyof AdminCache)[]) => {
    if (keys) {
      keys.forEach(key => {
        cacheRef.current[key] = null;
      });
    } else {
      // Invalidate all cache
      cacheRef.current = {
        users: null,
        categories: null,
        posts: null,
        comments: null,
        reports: null
      };
    }
  }, []);
  
  // User operations with caching
  const loadUsers = useCallback(async () => {
    if (!isAdmin || loadingUsers) return;
    
    // Check cache first
    const cachedUsers = cacheRef.current.users;
    if (isCacheValid(cachedUsers)) {
      setUsers(cachedUsers!.data);
      return;
    }
    
    try {
      setLoadingUsers(true);
      const usersData = await userOperations.list();
      setUsers(usersData);
      updateCache('users', usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin, loadingUsers, isCacheValid, updateCache]);
  
  const createUser = useCallback(async (userId: string, userData: Omit<User, 'id'>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await userOperations.create(userId, userData);
    invalidateCache(['users']);
    await loadUsers();
  }, [isAdmin, loadUsers, invalidateCache]);
  
  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await userOperations.update(userId, userData);
    invalidateCache(['users']);
    await loadUsers();
  }, [isAdmin, loadUsers, invalidateCache]);
  
  const deleteUser = useCallback(async (userId: string) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await userOperations.delete(userId);
    invalidateCache(['users']);
    await loadUsers();
  }, [isAdmin, loadUsers, invalidateCache]);
  
  // Category operations with caching
  const loadCategories = useCallback(async () => {
    if (!isAdmin || loadingCategories) return;
    
    // Check cache first
    const cachedCategories = cacheRef.current.categories;
    if (isCacheValid(cachedCategories)) {
      setCategories(cachedCategories!.data);
      return;
    }
    
    try {
      setLoadingCategories(true);
      const categoriesData = await forumCategoryOperations.list();
      setCategories(categoriesData);
      updateCache('categories', categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, [isAdmin, loadingCategories, isCacheValid, updateCache]);
  
  const createCategory = useCallback(async (categoryData: Omit<ForumCategory, 'id'>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumCategoryOperations.create(categoryData);
    invalidateCache(['categories']);
    await loadCategories();
  }, [isAdmin, loadCategories, invalidateCache]);
  
  const updateCategory = useCallback(async (categoryId: string, categoryData: Partial<ForumCategory>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumCategoryOperations.update(categoryId, categoryData);
    invalidateCache(['categories']);
    await loadCategories();
  }, [isAdmin, loadCategories, invalidateCache]);
  
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumCategoryOperations.delete(categoryId);
    invalidateCache(['categories']);
    await loadCategories();
  }, [isAdmin, loadCategories, invalidateCache]);
  
  // Post operations with caching
  const loadPosts = useCallback(async () => {
    if (!isAdmin || loadingPosts) return;
    
    // Check cache first
    const cachedPosts = cacheRef.current.posts;
    if (isCacheValid(cachedPosts)) {
      setPosts(cachedPosts!.data);
      return;
    }
    
    try {
      setLoadingPosts(true);
      const postsData = await forumPostOperations.list(undefined, 100); // Load more posts for admin
      setPosts(postsData);
      updateCache('posts', postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [isAdmin, loadingPosts, isCacheValid, updateCache]);
  
  const createPost = useCallback(async (postData: Omit<ForumPost, 'id'>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumPostOperations.create(postData);
    invalidateCache(['posts']);
    await loadPosts();
  }, [isAdmin, loadPosts, invalidateCache]);
  
  const updatePost = useCallback(async (postId: string, postData: Partial<ForumPost>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumPostOperations.update(postId, postData);
    invalidateCache(['posts']);
    await loadPosts();
  }, [isAdmin, loadPosts, invalidateCache]);
  
  const deletePost = useCallback(async (postId: string) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumPostOperations.delete(postId);
    invalidateCache(['posts']);
    await loadPosts();
  }, [isAdmin, loadPosts, invalidateCache]);
  
  // Comment operations with caching
  const loadComments = useCallback(async () => {
    if (!isAdmin || loadingComments) return;
    
    // Check cache first
    const cachedComments = cacheRef.current.comments;
    if (isCacheValid(cachedComments)) {
      setComments(cachedComments!.data);
      return;
    }
    
    try {
      setLoadingComments(true);
      // Load all comments from all posts (this is a simplified approach)
      // In a real app, you might want to paginate or filter this
      const postsData = await forumPostOperations.list(undefined, 100);
      const allComments: ForumComment[] = [];
      
      for (const post of postsData) {
        const postComments = await forumCommentOperations.getByPost(post.id);
        postComments.forEach(comment => {
          allComments.push(comment);
          if (comment.replies) {
            allComments.push(...comment.replies);
          }
        });
      }
      
      setComments(allComments);
      updateCache('comments', allComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [isAdmin, loadingComments, isCacheValid, updateCache]);
  
  const updateComment = useCallback(async (commentId: string, commentData: Partial<ForumComment>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumCommentOperations.update(commentId, commentData);
    invalidateCache(['comments']);
    await loadComments();
  }, [isAdmin, loadComments, invalidateCache]);
  
  const deleteComment = useCallback(async (commentId: string) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumCommentOperations.delete(commentId);
    invalidateCache(['comments']);
    await loadComments();
  }, [isAdmin, loadComments, invalidateCache]);
  
  // Report operations with caching
  const loadReports = useCallback(async () => {
    if (!isAdmin || loadingReports) return;
    
    // Check cache first
    const cachedReports = cacheRef.current.reports;
    if (isCacheValid(cachedReports)) {
      setReports(cachedReports!.data);
      return;
    }
    
    try {
      setLoadingReports(true);
      const reportsData = await forumReportOperations.listPending();
      setReports(reportsData);
      updateCache('reports', reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoadingReports(false);
    }
  }, [isAdmin, loadingReports, isCacheValid, updateCache]);
  
  const updateReport = useCallback(async (reportId: string, reportData: Partial<ForumReport>) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumReportOperations.update(reportId, reportData);
    invalidateCache(['reports']);
    await loadReports();
  }, [isAdmin, loadReports, invalidateCache]);
  
  const deleteReport = useCallback(async (reportId: string) => {
    if (!isAdmin) throw new Error('Access denied');
    
    await forumReportOperations.delete(reportId);
    invalidateCache(['reports']);
    await loadReports();
  }, [isAdmin, loadReports, invalidateCache]);
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!isAdmin) return;
    
    // Invalidate all cache before refreshing
    invalidateCache();
    
    await Promise.all([
      loadUsers(),
      loadCategories(),
      loadPosts(),
      loadComments(),
      loadReports()
    ]);
  }, [isAdmin, invalidateCache, loadUsers, loadCategories, loadPosts, loadComments, loadReports]);
  
  // Memoized selectors for filtered data
  const memoizedUsers = useMemo(() => users, [users]);
  const memoizedCategories = useMemo(() => categories, [categories]);
  const memoizedPosts = useMemo(() => posts, [posts]);
  const memoizedComments = useMemo(() => comments, [comments]);
  const memoizedReports = useMemo(() => reports, [reports]);
  
  // Memoized context value
  const contextValue = useMemo(() => ({
    users: memoizedUsers,
    loadingUsers,
    categories: memoizedCategories,
    loadingCategories,
    posts: memoizedPosts,
    loadingPosts,
    comments: memoizedComments,
    loadingComments,
    reports: memoizedReports,
    loadingReports,
    
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    
    loadComments,
    updateComment,
    deleteComment,
    
    loadReports,
    updateReport,
    deleteReport,
    
    refreshData
  }), [
    memoizedUsers, loadingUsers,
    memoizedCategories, loadingCategories,
    memoizedPosts, loadingPosts,
    memoizedComments, loadingComments,
    memoizedReports, loadingReports,
    
    loadUsers, createUser, updateUser, deleteUser,
    loadCategories, createCategory, updateCategory, deleteCategory,
    loadPosts, createPost, updatePost, deletePost,
    loadComments, updateComment, deleteComment,
    loadReports, updateReport, deleteReport,
    refreshData
  ]);
  
  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
