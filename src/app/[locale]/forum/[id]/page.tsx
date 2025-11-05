'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  MessageSquare, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  User, 
  Tag, 
  Flag,
  Reply,
  Send,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForum } from '@/contexts/ForumContext';
import { useUser } from '@/contexts/UserContext';

const scamTypes = {
  phishing: { labelKey: 'scamTypes.phishing', icon: '🎣' },
  social_engineering: { labelKey: 'scamTypes.social_engineering', icon: '🎭' },
  fake_websites: { labelKey: 'scamTypes.fake_websites', icon: '🌐' },
  phone_scams: { labelKey: 'scamTypes.phone_scams', icon: '📞' },
  email_scams: { labelKey: 'scamTypes.email_scams', icon: '📧' },
  investment_fraud: { labelKey: 'scamTypes.investment_fraud', icon: '💰' },
  romance_scams: { labelKey: 'scamTypes.romance_scams', icon: '💔' },
  tech_support_scams: { labelKey: 'scamTypes.tech_support_scams', icon: '🔧' },
  cryptocurrency_scams: { labelKey: 'scamTypes.cryptocurrency_scams', icon: '₿' },
  identity_theft: { labelKey: 'scamTypes.identity_theft', icon: '🆔' },
  other: { labelKey: 'scamTypes.other', icon: '❓' }
};

const severityLevels = {
  low: { labelKey: 'severity.low', icon: '🟢' },
  medium: { labelKey: 'severity.medium', icon: '🟡' },
  high: { labelKey: 'severity.high', icon: '🟠' },
  critical: { labelKey: 'severity.critical', icon: '🔴' }
};


export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('forum');
  const { currentUser } = useUser();
  const {
    currentPost,
    comments,
    loadingCurrentPost,
    loadingComments,
    loadPost,
    loadComments,
    createComment,
    voteOnPost,
    voteOnComment,
    reportPost,
    reportComment
  } = useForum();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{type: 'post' | 'comment', id: string} | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const postId = params.id as string;

  useEffect(() => {
    if (postId) {
      loadPost(postId);
      loadComments(postId);
    }
  }, [postId, loadPost, loadComments]);

  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentUser || !currentPost) return;

    try {
      await createComment({
        postId: currentPost.id,
        content: newComment,
        attachments: [],
        authorId: currentUser.id
      });
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCreateReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !currentUser || !currentPost) return;

    try {
      await createComment({
        postId: currentPost.id,
        content: replyContent,
        parentCommentId,
        attachments: [],
        authorId: currentUser.id
      });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleVote = async (targetId: string, targetType: 'post' | 'comment', voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return;

    try {
      if (targetType === 'post') {
        await voteOnPost(targetId, voteType);
      } else {
        await voteOnComment(targetId, voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReport = async () => {
    if (!reportTarget || !reportReason || !currentUser) return;

    try {
      if (reportTarget.type === 'post') {
        await reportPost(reportTarget.id, reportReason, reportDescription);
      } else {
        await reportComment(reportTarget.id, reportReason, reportDescription);
      }
      setShowReportModal(false);
      setReportTarget(null);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loadingCurrentPost) {
    return (
      <div className="min-h-screen bg-[#01032C] text-[#A1CCB0] flex items-center justify-center">
        <div className="text-2xl font-mono">{t('post.loading')}</div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-[#01032C] text-[#A1CCB0] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-4 font-mono">{t('post.notFoundTitle')}</h1>
          <Link href="/forum" className="text-[#A1CCB0] hover:underline font-mono">
            {t('post.backToForum')}
          </Link>
        </div>
      </div>
    );
  }

  const severityInfo = severityLevels[currentPost.severity as keyof typeof severityLevels];
  const scamTypeInfo = scamTypes[currentPost.scamType as keyof typeof scamTypes];

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
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-6 md:p-8 mb-8 rounded-xl"
          >
            {/* Post Header */}
            <div className="mb-6">
              <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mt-4 sm:mt-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {currentPost.isPinned && (
                      <span className="px-3 py-1 bg-[#91B1C0] text-[#01032C] text-xs sm:text-sm font-mono font-bold rounded-md">{t('post.pinned')}</span>
                    )}
                    <span className="px-3 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs sm:text-sm font-mono rounded-md">
                      {severityInfo.icon} {t(severityInfo.labelKey).toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs sm:text-sm font-mono rounded-md">
                      {scamTypeInfo.icon} {t(scamTypeInfo.labelKey).toUpperCase()}
                    </span>
                    {currentPost.isResolved && (
                      <span className="px-3 py-1 bg-[#A1CCB0]/20 text-[#A1CCB0] text-xs sm:text-sm font-mono flex items-center gap-1 rounded-md">
                        <Shield className="w-4 h-4" />
                        {t('post.resolved')}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold mb-4 font-mono text-[#A1CCB0]">{currentPost.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#91B1C0] mb-6 font-mono">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{currentPost.author.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(currentPost.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{currentPost.viewCount} views</span>
                    </div>
                  </div>
                </div>
                
                {currentUser && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        setReportTarget({ type: 'post', id: currentPost.id });
                        setShowReportModal(true);
                      }}
                      className="p-3 text-[#91B1C0] hover:text-red-500 hover:bg-[#91B1C0]/10 rounded-full transition-colors"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-[#91B1C0] font-mono whitespace-pre-wrap">{currentPost.content}</p>
            </div>

            {/* Tags */}
            {currentPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentPost.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-sm font-mono flex items-center gap-1 rounded-md">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Vote Buttons */}
            {currentUser && (
              <div className="flex items-center gap-2 sm:gap-4 pt-4 border-t border-[#91B1C0]/20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(currentPost.id, 'post', 'upvote')}
                    className="flex items-center gap-1 px-4 py-2 text-[#A1CCB0] bg-[#A1CCB0]/10 hover:bg-[#A1CCB0]/20 font-mono rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                    <span>{currentPost.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(currentPost.id, 'post', 'downvote')}
                    className="flex items-center gap-1 px-4 py-2 text-[#91B1C0] bg-[#91B1C0]/10 hover:bg-[#91B1C0]/20 font-mono rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                    <span>{currentPost.downvotes}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Comments Section */}
          <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-6 md:p-8 rounded-xl">
            <h2 className="text-xl md:text-2xl font-bold mb-6 font-mono flex items-center gap-2 text-[#A1CCB0]">
              <MessageSquare className="w-6 h-6" />
              {t('post.comments', { count: comments.length })}
            </h2>

            {/* New Comment Form */}
            {currentUser ? (
              <div className="mb-8 p-4 bg-[#91B1C0]/10 border border-[#91B1C0]/20 rounded-lg">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('post.newCommentPlaceholder')}
                  className="w-full px-4 py-3 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono resize-none rounded-lg placeholder-[#91B1C0]/50"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-3 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 disabled:bg-[#91B1C0]/20 disabled:text-[#91B1C0]/50 disabled:border-transparent font-mono font-bold border-2 border-[#A1CCB0] flex items-center gap-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {t('post.postComment')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-[#91B1C0]/10 border border-[#91B1C0]/20 text-center rounded-lg">
                <p className="font-mono text-[#91B1C0] mb-2">{t('post.loginPrompt')}</p>
                <Link href="/login" className="text-[#A1CCB0] hover:underline font-mono">
                  {t('post.loginHere')}
                </Link>
              </div>
            )}

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-8">
                <div className="text-lg font-mono text-[#91B1C0]">{t('post.loadingComments')}</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#91B1C0] font-mono">{t('post.noComments')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-[#91B1C0]/20 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#91B1C0]" />
                          <span className="font-bold font-mono text-[#A1CCB0]">{comment.author.displayName}</span>
                          {comment.isModerator && (
                            <span className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-mono rounded-md">MOD</span>
                          )}
                          {comment.isHelpful && (
                            <span className="px-2 py-1 bg-[#A1CCB0]/20 text-[#A1CCB0] text-xs font-mono rounded-md">HELPFUL</span>
                          )}
                        </div>
                        <span className="text-sm text-[#91B1C0] font-mono">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      {currentUser && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="p-2 text-[#91B1C0] hover:text-[#A1CCB0] rounded-full hover:bg-[#91B1C0]/10 transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setReportTarget({ type: 'comment', id: comment.id });
                              setShowReportModal(true);
                            }}
                            className="p-2 text-[#91B1C0] hover:text-red-500 rounded-full hover:bg-[#91B1C0]/10 transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-[#91B1C0] font-mono mb-3 whitespace-pre-wrap">{comment.content}</p>

                    {currentUser && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(comment.id, 'comment', 'upvote')}
                          className="flex items-center gap-1 px-3 py-1 text-[#A1CCB0] bg-[#A1CCB0]/10 hover:bg-[#A1CCB0]/20 text-sm font-mono rounded-md transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span>{comment.upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleVote(comment.id, 'comment', 'downvote')}
                          className="flex items-center gap-1 px-3 py-1 text-[#91B1C0] bg-[#91B1C0]/10 hover:bg-[#91B1C0]/20 text-sm font-mono rounded-md transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>{comment.downvotes}</span>
                        </button>
                      </div>
                    )}

                    {replyingTo === comment.id && (
                      <div className="mt-4 p-3 bg-[#91B1C0]/10 border border-[#91B1C0]/20 rounded-lg">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t('post.replyPlaceholder')}
                          className="w-full px-3 py-2 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono resize-none rounded-lg placeholder-[#91B1C0]/50"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 text-[#91B1C0] bg-transparent hover:bg-[#91B1C0]/10 font-mono text-sm border border-[#91B1C0] rounded-md transition-colors"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={() => handleCreateReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-4 py-2 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 disabled:bg-[#91B1C0]/20 disabled:text-[#91B1C0]/50 font-mono font-bold text-sm rounded-md transition-colors"
                          >
                            {t('post.reply')}
                          </button>
                        </div>
                      </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-4 sm:ml-6 space-y-4 border-l-2 border-[#91B1C0]/30 pl-3 sm:pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="border border-[#91B1C0]/20 p-3 rounded-md">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <User className="w-3 h-3 text-[#91B1C0]" />
                              <span className="font-bold font-mono text-sm text-[#A1CCB0]">{reply.author.displayName}</span>
                              <span className="text-xs text-[#91B1C0] font-mono">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-[#91B1C0] font-mono text-sm whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#01032C]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 text-[#91B1C0] p-6 max-w-md w-full rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4 font-mono flex items-center gap-2 text-[#A1CCB0]">
              <AlertTriangle className="w-5 h-5" />
              {t('post.report.title')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-mono mb-2 text-[#A1CCB0]">{t('post.report.reason')}</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono rounded-lg"
                >
                  <option value="">{t('post.report.selectReason')}</option>
                  <option value="spam">{t('reportReasons.spam')}</option>
                  <option value="inappropriate_content">{t('reportReasons.inappropriate_content')}</option>
                  <option value="harassment">{t('reportReasons.harassment')}</option>
                  <option value="misinformation">{t('reportReasons.misinformation')}</option>
                  <option value="off_topic">{t('reportReasons.off_topic')}</option>
                  <option value="duplicate">{t('reportReasons.duplicate')}</option>
                  <option value="other">{t('reportReasons.other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block font-mono mb-2 text-[#A1CCB0]">{t('post.report.additional')}</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none font-mono resize-none rounded-lg placeholder-[#91B1C0]/50"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-[#91B1C0] bg-transparent hover:bg-[#91B1C0]/10 font-mono border border-[#91B1C0] rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-[#91B1C0]/20 disabled:text-[#91B1C0]/50 font-mono rounded-md transition-colors"
              >
                {t('post.report.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}