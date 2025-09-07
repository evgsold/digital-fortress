'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, MessageSquare, ChevronUp, ChevronDown, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForum } from '@/contexts/ForumContext';
import { useUser } from '@/contexts/UserContext';

const scamTypes = [
  { value: 'phishing', icon: '🎣' },
  { value: 'social_engineering', icon: '🎭' },
  { value: 'fake_websites', icon: '🌐' },
  { value: 'phone_scams', icon: '📞' },
  { value: 'email_scams', icon: '📧' },
  { value: 'investment_fraud', icon: '💰' },
  { value: 'romance_scams', icon: '💔' },
  { value: 'tech_support_scams', icon: '🔧' },
  { value: 'cryptocurrency_scams', icon: '₿' },
  { value: 'identity_theft', icon: '🆔' },
  { value: 'other', icon: '❓' }
];

const severityLevels = [
  { value: 'low', color: 'bg-green-100 text-green-800', icon: '🟢' },
  { value: 'medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  { value: 'high', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  { value: 'critical', color: 'bg-red-100 text-red-800', icon: '🔴' }
];

export default function ForumPage() {
  const t = useTranslations('forum');
  const { currentUser } = useUser();
  const {
    posts,
    categories,
    loadingPosts,
    loadingCategories,
    searchTerm,
    selectedCategory,
    selectedScamType,
    selectedSeverity,
    loadPosts,
    searchPosts,
    setSearchTerm,
    setSelectedCategory,
    setSelectedScamType,
    setSelectedSeverity
  } = useForum();

  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    if (!searchTerm && !selectedCategory && !selectedScamType && !selectedSeverity) {
      loadPosts();
    }
  }, [searchTerm, selectedCategory, selectedScamType, selectedSeverity]); // Removed loadPosts from dependencies to prevent infinite re-renders

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      setSearchTerm(localSearchTerm);
      searchPosts(localSearchTerm);
    } else {
      setSearchTerm('');
      loadPosts(selectedCategory || undefined);
    }
  };

  const handleFilterChange = () => {
    if (searchTerm) {
      searchPosts(searchTerm);
    } else {
      loadPosts(selectedCategory || undefined);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocalSearchTerm('');
    setSelectedCategory(null);
    setSelectedScamType(null);
    setSelectedSeverity(null);
    loadPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityInfo = (severity: string) => {
    return severityLevels.find(s => s.value === severity) || severityLevels[0];
  };

  const getScamTypeInfo = (scamType: string) => {
    return scamTypes.find(s => s.value === scamType) || scamTypes[scamTypes.length - 1];
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b-2 border-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-mono">{t('title')}</h1>
            </div>
            <p className="text-xl text-gray-300 font-mono">{t('subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white text-black border-2 border-black p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-mono">{t('filters.title')}</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div>
                  <h3 className="font-bold mb-3 font-mono">{t('filters.categories')}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        handleFilterChange();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono border-2 ${
                        !selectedCategory ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t('filters.allCategories')}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          handleFilterChange();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-mono border-2 ${
                          selectedCategory === category.id ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scam Types */}
                <div>
                  <h3 className="font-bold mb-3 font-mono">{t('filters.scamTypes')}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedScamType(null);
                        handleFilterChange();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono border-2 ${
                        !selectedScamType ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t('filters.allTypes')}
                    </button>
                    {scamTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedScamType(type.value);
                          handleFilterChange();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-mono border-2 flex items-center gap-2 ${
                          selectedScamType === type.value ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span>{t(`scamTypes.${type.value}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <h3 className="font-bold mb-3 font-mono">{t('filters.severity')}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSeverity(null);
                        handleFilterChange();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono border-2 ${
                        !selectedSeverity ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t('filters.allLevels')}
                    </button>
                    {severityLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => {
                          setSelectedSeverity(level.value);
                          handleFilterChange();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-mono border-2 flex items-center gap-2 ${
                          selectedSeverity === level.value ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>{level.icon}</span>
                        <span>{t(`severity.${level.value}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 font-mono border-2 border-black"
                >
                  {t('filters.clear')}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white border-2 border-black p-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none font-mono"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-black text-white hover:bg-gray-800 font-mono border-2 border-black flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {t('search.button')}
                </button>
              </div>
            </div>

            {/* Create Post Button */}
            {currentUser && (
              <div className="mb-6">
                <Link
                  href="/forum/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 font-mono border-2 border-black"
                >
                  <MessageSquare className="w-5 h-5" />
                  {t('createPost')}
                </Link>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="text-center py-8">
                  <div className="text-xl font-mono">{t('loadingPosts')}</div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white text-black border-2 border-black p-8 text-center">
                  <h3 className="text-xl font-bold mb-2 font-mono">{t('noPostsTitle')}</h3>
                  <p className="text-gray-600 font-mono">{t('noPostsHint')}</p>
                </div>
              ) : (
                posts.map((post) => {
                  const severityInfo = getSeverityInfo(post.severity);
                  const scamTypeInfo = getScamTypeInfo(post.scamType);
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white text-black border-2 border-black p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && (
                              <span className="px-2 py-1 bg-black text-white text-xs font-mono">PINNED</span>
                            )}
                            <span className={`px-2 py-1 text-xs font-mono ${severityInfo.color}`}>
                              {severityInfo.icon} {t(`severity.${post.severity}`).toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono">
                              {scamTypeInfo.icon} {t(`scamTypes.${post.scamType}`).toUpperCase()}
                            </span>
                          </div>
                          
                          <Link href={`/forum/${post.id}`}>
                            <h3 className="text-xl font-bold mb-2 hover:underline font-mono cursor-pointer">
                              {post.title}
                            </h3>
                          </Link>
                          
                          <p className="text-gray-600 mb-4 font-mono line-clamp-3">
                            {post.content.substring(0, 200)}...
                          </p>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-mono flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 font-mono">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{t('author', { id: post.authorId.substring(0, 8) })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <ChevronUp className="w-4 h-4 text-green-600" />
                              <span>{post.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ChevronDown className="w-4 h-4 text-red-600" />
                              <span>{post.downvotes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
