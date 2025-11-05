import { db } from './init';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  writeBatch, // Важно для транзакционных удалений
  arrayUnion, // Для добавления элементов в массив
  arrayRemove
} from 'firebase/firestore';
import { 
  userSchema,
  forumCategorySchema,
  forumPostSchema,
  forumCommentSchema,
  forumVoteSchema,
  forumReportSchema,
  blogAuthorSchema,
  blogCategorySchema,
  blogPostSchema,
} from './schemas';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll, ref } from 'firebase/storage';

import type { 
  User,
  ForumCategory,
  ForumPost,
  ForumComment,
  ForumVote,
  ForumReport,
  ForumPostWithAuthor,
  ForumCommentWithAuthor,
  BlogCategory,
  BlogAuthor,
  BlogPost,
} from '@/types/database';

// Базовые операции CRUD для Firestore
const createOperation = async <T>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id'>,
  schema: any
) => {
  const validatedData = schema.parse(data);
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, validatedData);
  return validatedData;
};

const readOperation = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as T) : null;
};

const updateOperation = async <T>(collectionName: string, docId: string, data: Partial<T>, schema: any) => {
  const existingData = await readOperation<T>(collectionName, docId);
  const validatedData = schema.parse({ ...existingData, ...data });
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, validatedData);
  return validatedData;
};

const deleteOperation = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

export const userOperations = {
  create: (userId: string, data: Omit<User, 'id'>) =>
    createOperation('users', userId, data, userSchema),
  read: (userId: string) => readOperation<User>('users', userId),
  update: (userId: string, data: Partial<User>) =>
    updateOperation('users', userId, data, userSchema),
  delete: (userId: string) => deleteOperation('users', userId),
  list: async (): Promise<User[]> => {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push({ ...doc.data() as Omit<User, 'id'>, id: doc.id });
    });
    return users;
  },
  getByEmail: async (email: string) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { userId: doc.id, ...doc.data() as User };
  },
  getById: async (userId: string) => {
    return await readOperation<User>('users', userId);
  }
};

// Forum Category Operations
export const forumCategoryOperations = {
  create: async (data: Omit<ForumCategory, 'id'>) => {
    const categoriesCollection = collection(db, 'forumCategories');
    const docRef = await addDoc(categoriesCollection, forumCategorySchema.parse(data));
    return { id: docRef.id, ...data };
  },
  read: (categoryId: string) => readOperation<ForumCategory>('forumCategories', categoryId),
  update: (categoryId: string, data: Partial<ForumCategory>) =>
    updateOperation('forumCategories', categoryId, data, forumCategorySchema),
  delete: (categoryId: string) => deleteOperation('forumCategories', categoryId),
  list: async (): Promise<ForumCategory[]> => {
    const categoriesCollection = collection(db, 'forumCategories');
    const q = query(categoriesCollection, where('isActive', '==', true), orderBy('name'));
    const snapshot = await getDocs(q);
    const categories: ForumCategory[] = [];
    snapshot.forEach((doc) => {
      categories.push({ ...doc.data() as Omit<ForumCategory, 'id'>, id: doc.id });
    });
    return categories;
  }
};

// Forum Post Operations
export const forumPostOperations = {
  create: async (data: Omit<ForumPost, 'id'>) => {
    const postsCollection = collection(db, 'forumPosts');
    const docRef = await addDoc(postsCollection, forumPostSchema.parse(data));
    return { id: docRef.id, ...data };
  },
  read: (postId: string) => readOperation<ForumPost>('forumPosts', postId),
  update: (postId: string, data: Partial<ForumPost>) =>
    updateOperation('forumPosts', postId, data, forumPostSchema),
  delete: (postId: string) => deleteOperation('forumPosts', postId),
  list: async (categoryId?: string, limitCount = 20): Promise<ForumPost[]> => {
    const postsCollection = collection(db, 'forumPosts');
    let q = query(
      postsCollection,
      orderBy('isPinned', 'desc'),
      orderBy('lastActivityAt', 'desc'),
      limit(limitCount)
    );
    
    if (categoryId) {
      q = query(
        postsCollection,
        where('categoryId', '==', categoryId),
        orderBy('isPinned', 'desc'),
        orderBy('lastActivityAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const posts: ForumPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ ...doc.data() as Omit<ForumPost, 'id'>, id: doc.id });
    });
    return posts;
  },
  getByAuthor: async (authorId: string, limitCount = 50): Promise<ForumPost[]> => {
    const postsCollection = collection(db, 'forumPosts');
    const q = query(
      postsCollection,
      where('authorId', '==', authorId)
    );
    const snapshot = await getDocs(q);
    const posts: ForumPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ ...doc.data() as Omit<ForumPost, 'id'>, id: doc.id });
    });
    // Sort client-side to avoid composite index requirement
    posts.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
    return posts.slice(0, limitCount);
  },
  getWithAuthor: async (postId: string): Promise<ForumPostWithAuthor | null> => {
    const post = await readOperation<ForumPost>('forumPosts', postId);
    if (!post) return null;
    
    const author = await readOperation<User>('users', post.authorId);
    const category = await readOperation<ForumCategory>('forumCategories', post.categoryId);
    
    if (!author || !category) return null;
    
    // Important: Firestore's doc data doesn't include the document ID; merge it explicitly
    return { ...post, id: postId, author, category } as ForumPostWithAuthor;
  },
  incrementViewCount: async (postId: string) => {
    const postRef = doc(db, 'forumPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().viewCount || 0;
      await updateDoc(postRef, { viewCount: currentCount + 1 });
    }
  },
  search: async (searchTerm: string, limitCount = 20): Promise<ForumPost[]> => {
    // Note: This is a basic search. For production, consider using Algolia or similar
    const postsCollection = collection(db, 'forumPosts');
    const snapshot = await getDocs(postsCollection);
    const posts: ForumPost[] = [];
    
    snapshot.forEach((doc) => {
      const post = { ...doc.data() as Omit<ForumPost, 'id'>, id: doc.id };
      const searchInTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const searchInContent = post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const searchInTags = post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (searchInTitle || searchInContent || searchInTags) {
        posts.push(post);
      }
    });
    
    return posts.slice(0, limitCount);
  }
};

// Forum Comment Operations
export const forumCommentOperations = {
  create: async (data: Omit<ForumComment, 'id'>) => {
    const commentsCollection = collection(db, 'forumComments');
    const docRef = await addDoc(commentsCollection, forumCommentSchema.parse(data));
    
    // Update post comment count
    const postRef = doc(db, 'forumPosts', data.postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentCount || 0;
      await updateDoc(postRef, { 
        commentCount: currentCount + 1,
        lastActivityAt: data.createdAt
      });
    }
    
    return { id: docRef.id, ...data };
  },
  read: (commentId: string) => readOperation<ForumComment>('forumComments', commentId),
  update: (commentId: string, data: Partial<ForumComment>) =>
    updateOperation('forumComments', commentId, data, forumCommentSchema),
  delete: async (commentId: string) => {
    const comment = await readOperation<ForumComment>('forumComments', commentId);
    if (comment) {
      await deleteOperation('forumComments', commentId);
      
      // Update post comment count
      const postRef = doc(db, 'forumPosts', comment.postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentCount = postSnap.data().commentCount || 0;
        await updateDoc(postRef, { commentCount: Math.max(0, currentCount - 1) });
      }
    }
  },
  getByPost: async (postId: string): Promise<ForumCommentWithAuthor[]> => {
    const commentsCollection = collection(db, 'forumComments');
    const q = query(
      commentsCollection,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const comments: ForumCommentWithAuthor[] = [];
    
    for (const docSnap of snapshot.docs) {
      const comment = { ...docSnap.data() as Omit<ForumComment, 'id'>, id: docSnap.id };
      const author = await readOperation<User>('users', comment.authorId);
      
      if (author) {
        comments.push({ ...comment, author });
      }
    }
    
    // Organize comments with replies
    const topLevelComments: ForumCommentWithAuthor[] = [];
    const repliesMap = new Map<string, ForumCommentWithAuthor[]>();
    
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        if (!repliesMap.has(comment.parentCommentId)) {
          repliesMap.set(comment.parentCommentId, []);
        }
        repliesMap.get(comment.parentCommentId)!.push(comment);
      } else {
        topLevelComments.push(comment);
      }
    });
    
    // Add replies to parent comments
    topLevelComments.forEach(comment => {
      comment.replies = repliesMap.get(comment.id) || [];
    });
    
    return topLevelComments;
  }
};

// Forum Vote Operations
export const forumVoteOperations = {
  create: async (data: Omit<ForumVote, 'id'>) => {
    const votesCollection = collection(db, 'forumVotes');
    
    // Check if user already voted on this target
    const existingVoteQuery = query(
      votesCollection,
      where('userId', '==', data.userId),
      where('targetId', '==', data.targetId),
      where('targetType', '==', data.targetType)
    );
    const existingVoteSnapshot = await getDocs(existingVoteQuery);
    
    // Remove existing vote if it exists
    if (!existingVoteSnapshot.empty) {
      const existingVote = existingVoteSnapshot.docs[0];
      await deleteDoc(existingVote.ref);
      
      // Update vote counts
      await updateVoteCounts(data.targetId, data.targetType, existingVote.data().voteType, 'remove');
    }
    
    // Add new vote
    const docRef = await addDoc(votesCollection, forumVoteSchema.parse(data));
    
    // Update vote counts
    await updateVoteCounts(data.targetId, data.targetType, data.voteType, 'add');
    
    return { id: docRef.id, ...data };
  },
  getUserVote: async (userId: string, targetId: string, targetType: 'post' | 'comment'): Promise<ForumVote | null> => {
    const votesCollection = collection(db, 'forumVotes');
    const q = query(
      votesCollection,
      where('userId', '==', userId),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { ...doc.data() as Omit<ForumVote, 'id'>, id: doc.id };
  },
  remove: async (userId: string, targetId: string, targetType: 'post' | 'comment') => {
    const votesCollection = collection(db, 'forumVotes');
    const q = query(
      votesCollection,
      where('userId', '==', userId),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const voteDoc = snapshot.docs[0];
      const voteData = voteDoc.data();
      await deleteDoc(voteDoc.ref);
      
      // Update vote counts
      await updateVoteCounts(targetId, targetType, voteData.voteType, 'remove');
    }
  }
};

// Helper function to update vote counts
const updateVoteCounts = async (targetId: string, targetType: 'post' | 'comment', voteType: 'upvote' | 'downvote', action: 'add' | 'remove') => {
  const collectionName = targetType === 'post' ? 'forumPosts' : 'forumComments';
  const targetRef = doc(db, collectionName, targetId);
  const targetSnap = await getDoc(targetRef);
  
  if (targetSnap.exists()) {
    const data = targetSnap.data();
    const upvotes = data.upvotes || 0;
    const downvotes = data.downvotes || 0;
    
    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    
    if (voteType === 'upvote') {
      newUpvotes = action === 'add' ? upvotes + 1 : Math.max(0, upvotes - 1);
    } else {
      newDownvotes = action === 'add' ? downvotes + 1 : Math.max(0, downvotes - 1);
    }
    
    await updateDoc(targetRef, {
      upvotes: newUpvotes,
      downvotes: newDownvotes
    });
  }
};

// Forum Report Operations
export const forumReportOperations = {
  create: async (data: Omit<ForumReport, 'id'>) => {
    const reportsCollection = collection(db, 'forumReports');
    const docRef = await addDoc(reportsCollection, forumReportSchema.parse(data));
    return { id: docRef.id, ...data };
  },
  read: (reportId: string) => readOperation<ForumReport>('forumReports', reportId),
  update: (reportId: string, data: Partial<ForumReport>) =>
    updateOperation('forumReports', reportId, data, forumReportSchema),
  delete: (reportId: string) => deleteOperation('forumReports', reportId),
  listPending: async (): Promise<ForumReport[]> => {
    const reportsCollection = collection(db, 'forumReports');
    const q = query(
      reportsCollection,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reports: ForumReport[] = [];
    snapshot.forEach((doc) => {
      reports.push({ ...doc.data() as Omit<ForumReport, 'id'>, id: doc.id });
    });
    return reports;
  },
  getByTarget: async (targetId: string, targetType: 'post' | 'comment'): Promise<ForumReport[]> => {
    const reportsCollection = collection(db, 'forumReports');
    const q = query(
      reportsCollection,
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reports: ForumReport[] = [];
    snapshot.forEach((doc) => {
      reports.push({ ...doc.data() as Omit<ForumReport, 'id'>, id: doc.id });
    });
    return reports;
  }
};

export const blogAuthorOperations = {
  create: (authorId: string, data: Omit<BlogAuthor, 'id'>) =>
    createOperation('blogAuthors', authorId, data, blogAuthorSchema),
  read: (authorId: string) => readOperation<BlogAuthor>('blogAuthors', authorId),
  update: (authorId: string, data: Partial<BlogAuthor>) =>
    updateOperation('blogAuthors', authorId, data, blogAuthorSchema),
  delete: (authorId: string) => deleteOperation('blogAuthors', authorId),
  list: async (): Promise<BlogAuthor[]> => {
    const authorsCollection = collection(db, 'blogAuthors');
    const snapshot = await getDocs(authorsCollection);
    const authors: BlogAuthor[] = [];
    snapshot.forEach((doc) => {
      authors.push({ ...(doc.data() as Omit<BlogAuthor, 'id'>), id: doc.id });
    });
    return authors;
  }
};

export const blogCategoryOperations = {
  create: (categoryId: string, data: Omit<BlogCategory, 'id'>) =>
    createOperation('blogCategories', categoryId, data, blogCategorySchema),
  read: (categoryId: string) => readOperation<BlogCategory>('blogCategories', categoryId),
  update: (categoryId: string, data: Partial<BlogCategory>) =>
    updateOperation('blogCategories', categoryId, data, blogCategorySchema),
  delete: (categoryId: string) => deleteOperation('blogCategories', categoryId),
  list: async (): Promise<BlogCategory[]> => {
    const categoriesCollection = collection(db, 'blogCategories');
    const snapshot = await getDocs(categoriesCollection);
    const categories: BlogCategory[] = [];
    snapshot.forEach((doc) => {
      categories.push({ ...(doc.data() as Omit<BlogCategory, 'id'>), id: doc.id });
    });
    return categories;
  }
};

export const blogPostOperations = {
  create: async (postId: string, data: Omit<BlogPost, 'id'>) => {
    console.log('Creating blog post with ID:', postId);
    return createOperation('blogPosts', postId, data, blogPostSchema);
  },
  
  read: async (postId: string) => {
    console.log('Reading blog post with ID:', postId);
    const post = await readOperation<BlogPost>('blogPosts', postId);
    console.log('Retrieved post:', post);
    return post;
  },
  
  update: async (postId: string, data: Partial<BlogPost>) => {
    console.log('Updating blog post with ID:', postId, 'Data:', data);
    return updateOperation('blogPosts', postId, data, blogPostSchema);
  },
  
  delete: async (postId: string) => {
    console.log('Deleting blog post with ID:', postId);
    return deleteOperation('blogPosts', postId);
  },
  
  list: async (): Promise<BlogPost[]> => {
    console.log('Fetching all blog posts...');
    try {
      const postsCollection = collection(db, 'blogPosts');
      console.log('Collection path:', postsCollection.path);
      
      const snapshot = await getDocs(postsCollection);
      console.log('Found', snapshot.size, 'blog posts');
      
      const posts: BlogPost[] = [];
      snapshot.forEach((doc) => {
        const postData = doc.data() as Omit<BlogPost, 'id'>;
        console.log('Post data:', { id: doc.id, ...postData });
        posts.push({ ...postData, id: doc.id });
      });
      
      return posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },
};

// Blog images (storage)
export const uploadBlogImage = async (postId: string, file: File) => {
  const storage = getStorage();
  const id = `${Date.now()}-${file.name}`;
  const path = `blog/images/${postId}/${id}`;
  const sref = storageRef(storage, path);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);
  return { id, postId, url, storagePath: path, uploadedAt: new Date().toISOString() };
};

export const deleteBlogImage = async (storagePath: string) => {
  const storage = getStorage();
  const sref = storageRef(storage, storagePath);
  await deleteObject(sref);
};