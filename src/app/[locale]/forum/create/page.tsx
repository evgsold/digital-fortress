'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Send, Tag, AlertTriangle, Shield, Plus, X, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForum } from '@/contexts/ForumContext';
import { useUser } from '@/contexts/UserContext';

const scamTypes = [
  { value: 'phishing', label: 'Phishing', icon: '🎣', description: 'Fraudulent emails or websites designed to steal personal information' },
  { value: 'social_engineering', label: 'Social Engineering', icon: '🎭', description: 'Manipulation tactics to trick people into revealing information' },
  { value: 'fake_websites', label: 'Fake Websites', icon: '🌐', description: 'Counterfeit websites that mimic legitimate services' },
  { value: 'phone_scams', label: 'Phone Scams', icon: '📞', description: 'Fraudulent calls attempting to steal money or information' },
  { value: 'email_scams', label: 'Email Scams', icon: '📧', description: 'Deceptive emails with malicious intent' },
  { value: 'investment_fraud', label: 'Investment Fraud', icon: '💰', description: 'Fake investment opportunities and financial scams' },
  { value: 'romance_scams', label: 'Romance Scams', icon: '💔', description: 'Fake romantic relationships used to exploit victims financially' },
  { value: 'tech_support_scams', label: 'Tech Support Scams', icon: '🔧', description: 'Fake technical support calls or pop-ups' },
  { value: 'cryptocurrency_scams', label: 'Crypto Scams', icon: '₿', description: 'Fraudulent cryptocurrency schemes and fake exchanges' },
  { value: 'identity_theft', label: 'Identity Theft', icon: '🆔', description: 'Unauthorized use of personal information' },
  { value: 'other', label: 'Other', icon: '❓', description: 'Other types of cybersecurity threats' }
];

const severityLevels = [
  { value: 'low', label: 'Low', icon: '🟢', description: 'Minor inconvenience, no financial loss' },
  { value: 'medium', label: 'Medium', icon: '🟡', description: 'Some impact, potential for small losses' },
  { value: 'high', label: 'High', icon: '🟠', description: 'Significant impact, substantial losses possible' },
  { value: 'critical', label: 'Critical', icon: '🔴', description: 'Severe impact, major financial or personal losses' }
];

export default function CreateForumPostPage() {
  const router = useRouter();
  const t = useTranslations('forum');
  const { currentUser } = useUser();
  const { categories, createPost, loadingCategories } = useForum();

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forum-draft');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, use default
        }
      }
    }
    return {
      title: '',
      content: '',
      categoryId: '',
      scamType: '',
      severity: '',
      tags: [] as string[],
      isResolved: false
    };
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, 'valid' | 'invalid' | 'pending'>>({});

  const memoizedScamTypes = useMemo(() => scamTypes, []);
  const memoizedSeverityLevels = useMemo(() => severityLevels, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && (formData.title || formData.content)) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('forum-draft', JSON.stringify(formData));
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData]);
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);
  
  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('forum-draft');
    }
  }, []);

  const validateField = useCallback((field: string, value: any) => {
    switch (field) {
      case 'title':
        return value?.trim() && value.length >= 5 && value.length <= 200;
      case 'content':
        return value?.trim() && value.length >= 10;
      case 'categoryId':
      case 'scamType':
      case 'severity':
        return !!value;
      default:
        return true;
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
    
    setValidationStatus((prev: Record<string, 'valid' | 'invalid' | 'pending'>) => ({ ...prev, [field]: 'pending' }));
    
    setTimeout(() => {
      const isValid = validateField(field, value);
      setValidationStatus((prev: Record<string, 'valid' | 'invalid' | 'pending'>) => ({ ...prev, [field]: isValid ? 'valid' : 'invalid' }));
    }, 300);
  }, [errors, validateField]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData((prev: typeof formData) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const suggestions: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    else if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';

    if (!formData.content.trim()) newErrors.content = 'Content is required';
    else if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.scamType) newErrors.scamType = 'Scam type is required';
    if (!formData.severity) newErrors.severity = 'Severity level is required';

    setErrors({ ...newErrors, ...suggestions });
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const postId = await createPost({
          title: formData.title.trim(),
          content: formData.content.trim(),
          categoryId: formData.categoryId,
          scamType: formData.scamType as any,
          severity: formData.severity as any,
          tags: formData.tags,
          attachments: [],
          isResolved: formData.isResolved,
          isPinned: false,
          isLocked: false,
          authorId: currentUser.userId
      });

      clearDraft();
      router.push(`/forum/${postId}`);
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({ 
        general: `Failed to create post: ${errorMessage}. Please check all fields and try again.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#01032C] text-[#A1CCB0] flex items-center justify-center">
        <div className="text-2xl font-mono">{t('create.redirectToLogin')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#01032C] text-[#91B1C0]">
      {/* Header */}
      <div className="bg-[#01032C] border-b-2 border-[#91B1C0]/20">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/forum"
            className="inline-flex items-center gap-2 text-[#91B1C0] hover:text-[#A1CCB0] mb-4 font-mono"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('post.backToForum')}
          </Link>
          <h1 className="text-3xl font-bold font-mono text-[#A1CCB0]">{t('create.title')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-8 rounded-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.general && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-mono">{errors.general}</span>
                </div>
              )}
              
              {typeof window !== 'undefined' && localStorage.getItem('forum-draft') && (
                <div className="flex items-center gap-2 text-[#A1CCB0] bg-[#91B1C0]/10 border border-[#91B1C0]/30 px-4 py-3 rounded-lg">
                  <Info className="w-5 h-5" />
                  <span className="font-mono">{t('create.draftSaved')}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.titleLabel')} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('create.titlePlaceholder')}
                    className={`w-full px-4 py-3 pr-10 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 focus:outline-none font-mono rounded-lg placeholder-[#91B1C0]/50 ${
                      errors.title ? 'border-red-500' : 
                      validationStatus.title === 'valid' ? 'border-[#A1CCB0]' :
                      'border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0]'
                    }`}
                  />
                  {validationStatus.title === 'valid' && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A1CCB0]" />
                  )}
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 font-mono">{errors.title}</p>
                )}
                <p className="text-[#91B1C0]/80 text-sm mt-1 font-mono">
                  {t('create.charsCount', { count: formData.title.length })}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.categoryLabel')} *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 focus:outline-none font-mono rounded-lg ${
                    errors.categoryId ? 'border-red-500' : 'border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0]'
                  }`}
                >
                  <option value="">{t('create.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1 font-mono">{errors.categoryId}</p>
                )}
              </div>

              {/* Scam Type */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.scamTypeLabel')} *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memoizedScamTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('scamType', type.value)}
                      className={`p-4 text-left border-2 transition-all duration-200 rounded-lg ${
                        formData.scamType === type.value
                          ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]'
                          : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-bold font-mono">{t(`scamTypes.${type.value}`)}</span>
                      </div>
                      <p className="text-sm font-mono opacity-80">{t(`create.scamTypeDesc.${type.value}`)}</p>
                    </button>
                  ))}
                </div>
                {errors.scamType && (
                  <p className="text-red-500 text-sm mt-1 font-mono">{errors.scamType}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.severityLabel')} *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memoizedSeverityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('severity', level.value)}
                      className={`p-4 text-left border-2 transition-all duration-200 rounded-lg ${
                        formData.severity === level.value
                          ? 'bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0]'
                          : 'bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{level.icon}</span>
                        <span className="font-bold font-mono">{t(`severity.${level.value}`)}</span>
                      </div>
                      <p className="text-sm font-mono opacity-80">{t(`create.severityDesc.${level.value}`)}</p>
                    </button>
                  ))}
                </div>
                {errors.severity && (
                  <p className="text-red-500 text-sm mt-1 font-mono">{errors.severity}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.descriptionLabel')} *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder={t('create.descriptionPlaceholder')}
                    rows={12}
                    className={`w-full px-4 py-3 pr-10 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 focus:outline-none font-mono resize-none rounded-lg placeholder-[#91B1C0]/50 ${
                      errors.content ? 'border-red-500' : 
                      validationStatus.content === 'valid' ? 'border-[#A1CCB0]' :
                      'border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0]'
                    }`}
                  />
                  {validationStatus.content === 'valid' && (
                    <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-[#A1CCB0]" />
                  )}
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1 font-mono">{errors.content}</p>
                )}
                <p className="text-[#91B1C0]/80 text-sm mt-1 font-mono">
                  {t('create.minChars')}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-lg font-bold mb-2 font-mono text-[#A1CCB0]">
                  {t('create.tagsLabel')}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('create.tagPlaceholder')}
                    className="flex-1 px-3 py-2 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono rounded-lg placeholder-[#91B1C0]/50"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] flex items-center gap-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('create.add')}
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] font-mono text-sm flex items-center gap-2 rounded-md"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-[#91B1C0]/80 text-sm font-mono">
                  {t('create.tagsHint')}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isResolved}
                    onChange={(e) => handleInputChange('isResolved', e.target.checked)}
                    className="w-5 h-5 rounded text-[#A1CCB0] bg-[#91B1C0]/20 border-[#91B1C0]/50 focus:ring-[#A1CCB0]"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#A1CCB0]" />
                    <span className="font-bold font-mono text-[#A1CCB0]">{t('create.markResolved')}</span>
                  </div>
                </label>
                <p className="text-[#91B1C0]/80 text-sm mt-1 ml-8 font-mono">
                  {t('create.markResolvedHint')}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#91B1C0]/20">
                <Link
                  href="/forum"
                  className="px-6 py-3 text-[#91B1C0] bg-transparent hover:bg-[#91B1C0]/10 font-mono border-2 border-[#91B1C0] rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.values(validationStatus).some(s => s === 'invalid')}
                  className="px-8 py-3 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 disabled:bg-[#91B1C0]/20 disabled:text-[#91B1C0]/50 disabled:border-transparent disabled:cursor-not-allowed font-mono font-bold border-2 border-[#A1CCB0] flex items-center gap-2 transition-all duration-300 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#01032C] border-t-transparent rounded-full animate-spin"></div>
                      {t('create.creating')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('create.submit')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}