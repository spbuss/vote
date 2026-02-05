
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MessageSquare, Send, MoreHorizontal, Flag, AlertCircle, Heart, X, UserPlus, UserCheck, Trash2, Clock } from 'lucide-react';
import { Question, Comment } from '../types';

interface QuestionCardProps {
  question: Question;
  currentUserId: string;
  onVote: (id: string, vote: 'yes' | 'no') => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, text: string, parentId?: string) => void;
  onLikeComment: (questionId: string, commentId: string) => void;
  onDeleteQuestion?: (id: string) => void;
  onDeleteComment?: (questionId: string, commentId: string) => void;
  isFollowingAuthor?: boolean;
  onToggleFollow?: () => void;
}

const getFormattedDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getFullDateWithTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  currentUserId,
  onVote, 
  onLike,
  onAddComment,
  onLikeComment,
  onDeleteQuestion,
  onDeleteComment,
  isFollowingAuthor,
  onToggleFollow
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);
  const [confirmReportId, setConfirmReportId] = useState<string | null>(null);
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);
  const [reportedCommentIds, setReportedCommentIds] = useState<Set<string>>(new Set());
  const [isShareFeedbackVisible, setIsShareFeedbackVisible] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [isPollReported, setIsPollReported] = useState(false);
  
  const isSharingInProgress = useRef(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalVotes = question.yesVotes + question.noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((question.yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((question.noVotes / totalVotes) * 100) : 0;

  useEffect(() => {
    if (showComments) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showComments]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(question.id, commentText, replyToId || undefined);
      setCommentText('');
      setReplyToId(null);
      setReplyToUser(null);
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleReplyInitiation = (commentId: string, userName: string) => {
    setReplyToId(commentId);
    setReplyToUser(userName);
    setCommentText(`@${userName} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleShare = async () => {
    if (isSharingInProgress.current) return;
    isSharingInProgress.current = true;
    const currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');
    
    const shareData = {
      title: 'Pulse Poll',
      text: `Vote on this: "${question.content}"`,
      url: isValidUrl ? currentUrl : undefined,
    };

    try {
      if (navigator.share && isValidUrl) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        const shareText = `${shareData.text}${shareData.url ? ' ' + shareData.url : ''}`;
        await navigator.clipboard.writeText(shareText);
        setIsShareFeedbackVisible(true);
        setTimeout(() => setIsShareFeedbackVisible(false), 2000);
      }
    } finally {
      isSharingInProgress.current = false;
    }
  };

  const renderCommentItem = (comment: Comment, depth = 0) => {
    const isReported = reportedCommentIds.has(comment.id);
    const isConfirmingReport = confirmReportId === comment.id;
    const isConfirmingDelete = confirmDeleteCommentId === comment.id;
    const isOwner = comment.userId === currentUserId;

    if (isReported) return null;

    return (
      <div key={comment.id} className="relative">
        <div className={`flex group py-3 pr-4 pl-4 ${depth > 0 ? 'ml-6 border-l border-slate-100' : ''}`}>
          <img 
            src={comment.userAvatar} 
            className={`${depth > 0 ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover mr-3 mt-0.5 shadow-sm`} 
            alt={comment.userName}
          />
          <div className="flex-1">
            <div className="text-[13px] leading-relaxed text-slate-800">
              <span className="font-bold mr-2 text-slate-900">{comment.userName}</span>
              {comment.text}
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-[11px] text-slate-400 font-medium" title={getFullDateWithTime(comment.createdAt)}>{getFormattedDate(comment.createdAt)}</span>
              {!isConfirmingReport && !isConfirmingDelete ? (
                <>
                  <button 
                    onClick={() => handleReplyInitiation(comment.id, comment.userName)}
                    className="text-[11px] text-slate-500 font-bold hover:text-slate-800 transition-colors"
                  >
                    Reply
                  </button>
                  {isOwner ? (
                    <button 
                      onClick={() => setConfirmDeleteCommentId(comment.id)}
                      className="text-[11px] text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  ) : (
                    <button 
                      onClick={() => setConfirmReportId(comment.id)}
                      className="text-[11px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Report
                    </button>
                  )}
                </>
              ) : isConfirmingReport ? (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-2">
                  <button onClick={() => { setReportedCommentIds(new Set([...reportedCommentIds, comment.id])); setConfirmReportId(null); }} className="text-[11px] text-rose-500 font-bold">Confirm Report</button>
                  <button onClick={() => setConfirmReportId(null)} className="text-[11px] text-slate-400">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-2">
                  <button onClick={() => { onDeleteComment?.(question.id, comment.id); setConfirmDeleteCommentId(null); }} className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">Confirm Delete</button>
                  <button onClick={() => setConfirmDeleteCommentId(null)} className="text-[11px] text-slate-400">Cancel</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center self-start mt-1 space-y-0.5">
            <button 
              onClick={() => onLikeComment(question.id, comment.id)}
              className={`transition-transform active:scale-125 ${comment.userLiked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-500'}`}
            >
              <Heart size={depth > 0 ? 11 : 12} fill={comment.userLiked ? "currentColor" : "none"} />
            </button>
            {comment.likes > 0 && (
              <span className="text-[9px] font-bold text-slate-400">{comment.likes}</span>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            {comment.replies.map(reply => renderCommentItem(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isPollReported) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-2xl mb-4 p-6 text-center animate-in fade-in zoom-in duration-300">
        <AlertCircle size={32} className="text-slate-400 mx-auto mb-3" />
        <h3 className="text-slate-600 font-bold mb-1">Poll Reported</h3>
        <button onClick={() => setIsPollReported(false)} className="text-xs font-bold text-indigo-600 uppercase">Undo</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl mb-4 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={question.authorAvatar} alt="" className="w-10 h-10 rounded-full border border-slate-100 shadow-sm" />
          <div className="flex items-center space-x-2">
            <div>
              <div className="flex items-center">
                <h3 className="font-bold text-sm text-slate-900">{question.authorName}</h3>
              </div>
              <p className={`text-[11px] font-bold tracking-wide uppercase ${question.category === 'Dating' ? 'text-rose-500' : 'text-slate-400'}`}>
                {question.category === 'Dating' ? '🔥 ' : ''}{question.category}
              </p>
            </div>
            {question.authorId !== currentUserId && onToggleFollow && (
              <>
                <span className="text-slate-300">•</span>
                <button 
                  onClick={onToggleFollow}
                  className={`text-[12px] font-bold transition-all px-2 py-0.5 rounded-full ${
                    isFollowingAuthor 
                      ? 'text-slate-500 bg-slate-100 hover:bg-slate-200' 
                      : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                  }`}
                >
                  {isFollowingAuthor ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>
        <button onClick={() => setShowOptionsSheet(true)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-[16px] font-medium text-slate-800 leading-snug mb-5">{question.content}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => onVote(question.id, 'yes')}
            disabled={!!question.userVote}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              question.userVote === 'yes' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider">Yes</span>
            {question.userVote && <span className="text-2xl font-black mt-1">{yesPercent}%</span>}
          </button>
          <button
            onClick={() => onVote(question.id, 'no')}
            disabled={!!question.userVote}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              question.userVote === 'no' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider">No</span>
            {question.userVote && <span className="text-2xl font-black mt-1">{noPercent}%</span>}
          </button>
        </div>
        
        {/* Total Votes Display */}
        <div className="px-1 mb-2">
           <span className="text-[12px] font-bold text-slate-400">{totalVotes.toLocaleString()} votes</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onLike(question.id)} 
            className={`flex items-center space-x-2 transition-transform active:scale-125 ${question.userLiked ? 'text-rose-500' : 'text-slate-800 hover:text-rose-500'}`}
          >
            <Heart size={24} fill={question.userLiked ? "currentColor" : "none"} strokeWidth={2} />
            <span className="text-[14px] font-bold">{question.likes}</span>
          </button>

          <button 
            onClick={() => setShowComments(true)} 
            className="flex items-center space-x-2 text-slate-800 hover:text-indigo-600 transition-transform active:scale-125"
          >
            <MessageSquare size={24} strokeWidth={2} />
            <span className="text-[14px] font-bold">{question.comments.length}</span>
          </button>

          <button onClick={handleShare} className="text-slate-800 hover:text-indigo-600 transition-transform active:scale-125">
            <Send size={24} strokeWidth={2} />
          </button>
        </div>
        {isShareFeedbackVisible && (
          <div className="text-[11px] font-bold text-emerald-600 animate-pulse">Link Copied!</div>
        )}
      </div>

      {/* New Row for Publish Date */}
      <div className="px-4 pb-3">
        <span 
          className="text-[10px] text-slate-400 font-bold uppercase tracking-tight cursor-help" 
          title={getFullDateWithTime(question.createdAt)}
        >
          Published {getFormattedDate(question.createdAt)}
        </span>
      </div>

      {/* Comments Bottom Sheet (Instagram Style) */}
      {showComments && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowComments(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl mx-auto rounded-t-[20px] flex flex-col h-[85vh] animate-in slide-in-from-bottom duration-300 shadow-2xl">
            {/* Drag Handle */}
            <div className="w-full h-1.5 flex justify-center py-4">
              <div className="w-9 h-1 bg-slate-200 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
              <div className="w-8"></div>
              <h2 className="text-sm font-bold text-slate-900">Comments</h2>
              <button onClick={() => setShowComments(false)} className="text-slate-900 p-1 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              <div className="flex py-4 px-4 border-b border-slate-50 mb-2">
                <img src={question.authorAvatar} className="w-8 h-8 rounded-full mr-3 mt-0.5 shadow-sm" alt="" />
                <div className="text-[13px] leading-relaxed">
                  <span className="font-bold mr-2 text-slate-900">{question.authorName}</span>
                  <span className="text-slate-800">{question.content}</span>
                  <div className="mt-1 text-[11px] text-slate-400 font-medium" title={getFullDateWithTime(question.createdAt)}>{getFormattedDate(question.createdAt)}</div>
                </div>
              </div>

              {question.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No comments yet</h3>
                  <p className="text-sm text-slate-400">Be the first to share your thoughts.</p>
                </div>
              ) : (
                <div className="pb-10">
                  {question.comments.map(c => renderCommentItem(c))}
                  <div ref={commentsEndRef} className="h-4"></div>
                </div>
              )}
            </div>

            {/* Replying to indicator */}
            {replyToUser && (
              <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <span className="text-[11px] text-indigo-700 font-medium">
                  Replying to <span className="font-bold">@{replyToUser}</span>
                </span>
                <button 
                  onClick={() => { setReplyToId(null); setReplyToUser(null); }}
                  className="text-indigo-400 hover:text-indigo-600 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Persistent Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
                <img src="https://picsum.photos/seed/alex/200" className="w-9 h-9 rounded-full border border-slate-100 shadow-sm" alt="" />
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    autoFocus
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Add a comment for ${question.authorName}...`}
                    className="w-full text-sm border border-slate-200 rounded-full pl-4 pr-16 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-600 disabled:opacity-30 hover:text-indigo-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Options Sheet Overlay */}
      {showOptionsSheet && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/40 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowOptionsSheet(false)}></div>
          <div className="relative bg-white w-full max-sm mx-auto rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            
            <div className="space-y-4">
              {question.authorId === currentUserId ? (
                <button 
                  onClick={() => { onDeleteQuestion?.(question.id); setShowOptionsSheet(false); }}
                  className="w-full flex items-center space-x-3 text-rose-600 font-bold p-3 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                  <span>Delete Poll</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setIsPollReported(true); setShowOptionsSheet(false); }}
                  className="w-full flex items-center space-x-3 text-rose-600 font-bold p-3 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Flag size={20} />
                  <span>Report this poll</span>
                </button>
              )}
              
              <button 
                onClick={() => setShowOptionsSheet(false)}
                className="w-full flex items-center justify-center text-slate-500 font-bold p-3 bg-slate-50 rounded-xl transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
