'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, MessageSquare, ChevronUp, ChevronDown, Calendar, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { value: 'low', icon: '🟢' },
  { value: 'medium', icon: '🟡' },
  { value: 'high', icon: '🟠' },
  { value: 'critical', icon: '🔴' }
];

// Компонент с содержимым фильтров, чтобы избежать дублирования кода
const FilterSections = ({
  selectedCategory,
  selectedScamType,
  selectedSeverity,
  categories,
  handleCategoryChange,
  handleScamTypeChange,
  handleSeverityChange,
  clearFilters,
  t
}: any) => (
  <div className="space-y-6 pt-4 lg:pt-0">
    {/* Categories */}
    <div>
      <h3 className="font-bold mb-3 font-mono text-[#A1CCB0]">{t('filters.categories')}</h3>
      <div className="space-y-2">
        <button onClick={() => handleCategoryChange(null)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}>{t('filters.allCategories')}</button>
        {categories.map((category: any) => (<button key={category.id} onClick={() => handleCategoryChange(category.id)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 rounded-lg transition-colors ${selectedCategory === category.id ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}>{category.name}</button>))}
      </div>
    </div>

    {/* Scam Types */}
    <div>
      <h3 className="font-bold mb-3 font-mono text-[#A1CCB0]">{t('filters.scamTypes')}</h3>
      <div className="space-y-2">
        <button onClick={() => handleScamTypeChange(null)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 rounded-lg transition-colors ${!selectedScamType ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}>{t('filters.allTypes')}</button>
        {scamTypes.map((type) => (<button key={type.value} onClick={() => handleScamTypeChange(type.value)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 flex items-center gap-2 rounded-lg transition-colors ${selectedScamType === type.value ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}><span>{type.icon}</span><span>{t(`scamTypes.${type.value}`)}</span></button>))}
      </div>
    </div>

    {/* Severity */}
    <div>
      <h3 className="font-bold mb-3 font-mono text-[#A1CCB0]">{t('filters.severity')}</h3>
      <div className="space-y-2">
        <button onClick={() => handleSeverityChange(null)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 rounded-lg transition-colors ${!selectedSeverity ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}>{t('filters.allLevels')}</button>
        {severityLevels.map((level) => (<button key={level.value} onClick={() => handleSeverityChange(level.value)} className={`w-full text-left px-3 py-2 text-sm font-mono border-2 flex items-center gap-2 rounded-lg transition-colors ${selectedSeverity === level.value ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]' : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'}`}><span>{level.icon}</span><span>{t(`severity.${level.value}`)}</span></button>))}
      </div>
    </div>
    
    <button onClick={clearFilters} className="w-full px-4 py-2 bg-[#91B1C0]/20 text-[#A1CCB0] hover:bg-[#91B1C0]/30 font-mono border-2 border-transparent rounded-lg transition-colors">{t('filters.clear')}</button>
  </div>
);


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
  }, [searchTerm, selectedCategory, selectedScamType, selectedSeverity]);

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

  const filterProps = {
    selectedCategory,
    selectedScamType,
    selectedSeverity,
    categories,
    handleCategoryChange: (value: string | null) => { setSelectedCategory(value); handleFilterChange(); },
    handleScamTypeChange: (value: string | null) => { setSelectedScamType(value); handleFilterChange(); },
    handleSeverityChange: (value: string | null) => { setSelectedSeverity(value); handleFilterChange(); },
    clearFilters,
    t
  };

  return (
    <div className="min-h-screen bg-[#01032C] text-[#91B1C0]">
      {/* Header */}
      <div className="bg-[#01032C] border-b-2 border-[#91B1C0]/20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-[#A1CCB0] rounded-lg">
                <MessageSquare className="w-8 h-8 text-[#01032C]" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-[#A1CCB0]">{t('title')}</h1>
            </div>
            <p className="text-lg sm:text-xl text-[#91B1C0] font-mono">{t('subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-6 lg:sticky lg:top-24 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-mono text-[#A1CCB0]">{t('filters.title')}</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-[#91B1C0]/10 rounded-lg"
                >
                  {showFilters ? <ChevronUp className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                </button>
              </div>

              {/* Animated container for mobile */}
              <div className="lg:hidden">
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      key="filters-mobile"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <FilterSections {...filterProps} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Static container for desktop */}
              <div className="hidden lg:block">
                <FilterSections {...filterProps} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-4 mb-6 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono rounded-lg placeholder-[#91B1C0]/50"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] flex items-center justify-center gap-2 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span className="sm:inline">{t('search.button')}</span>
                </button>
              </div>
            </div>

            {/* Create Post Button */}
            {currentUser && (
              <div className="mb-6">
                <Link
                  href="/forum/create"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] rounded-lg transition-colors"
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
                  <div className="text-xl font-mono text-[#91B1C0]">{t('loadingPosts')}</div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-[#01032C] border-2 border-dashed border-[#91B1C0]/30 p-8 text-center rounded-xl">
                  <h3 className="text-xl font-bold mb-2 font-mono text-[#A1CCB0]">{t('noPostsTitle')}</h3>
                  <p className="text-[#91B1C0] font-mono">{t('noPostsHint')}</p>
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
                      className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-6 hover:border-[#A1CCB0] transition-colors duration-300 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {post.isPinned && (
                              <span className="px-2 py-1 bg-[#91B1C0] text-[#01032C] text-xs font-mono font-bold rounded-md">PINNED</span>
                            )}
                            <span className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-mono rounded-md">
                              {severityInfo.icon} {t(`severity.${post.severity}`).toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-mono rounded-md">
                              {scamTypeInfo.icon} {t(`scamTypes.${post.scamType}`).toUpperCase()}
                            </span>
                          </div>
                          
                          <Link href={`/forum/${post.id}`}>
                            <h3 className="text-lg md:text-xl font-bold my-2 text-[#A1CCB0] hover:text-opacity-80 font-mono cursor-pointer transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                          
                          <p className="text-[#91B1C0] mb-4 font-mono line-clamp-3">
                            {post.content.substring(0, 200)}...
                          </p>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-mono flex items-center gap-1 rounded-md">
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between text-sm text-[#91B1C0] font-mono gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
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
                              <ChevronUp className="w-4 h-4 text-[#A1CCB0]" />
                              <span>{post.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ChevronDown className="w-4 h-4 text-[#91B1C0]" />
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