import React, { useState } from 'react';
import { MessageSquare, Send, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { Comment } from '../types';
import { api } from '../services/api';

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  comments,
  onCommentAdded
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      await api.postComment(articleId, {
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
        parentId: replyingTo
      });
      setContent('');
      setReplyingTo(null);
      setSuccessMsg('Your comment has been posted successfully!');
      onCommentAdded();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <section className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm my-8 space-y-8" id="comments-section">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Community Comments ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          {replyingTo ? 'Replying to comment' : 'Leave a Thoughtful Comment'}
        </h4>

        {replyingTo && (
          <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg">
            <span>Replying to comment #{replyingTo}</span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="font-bold underline hover:text-indigo-800"
            >
              Cancel Reply
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your Name *"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <input
            type="email"
            placeholder="Your Email (Optional, kept private)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Share your technical opinion or ask a question..."
          required
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full p-3.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Comments are moderated according to Editorial Quality Standards.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>

      {/* Comments Tree List */}
      <div className="space-y-6 pt-2">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">
            No comments yet. Be the first to start the conversation!
          </p>
        ) : (
          topLevelComments.map(comm => {
            const replies = comments.filter(c => c.parentId === comm.id);
            return (
              <div key={comm.id} className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comm.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comm.authorName}`}
                        alt={comm.authorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {comm.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setReplyingTo(comm.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                    {comm.content}
                  </p>
                </div>

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-6 border-l-2 border-indigo-200 dark:border-indigo-900 space-y-3">
                    {replies.map(reply => (
                      <div key={reply.id} className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={reply.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${reply.authorName}`}
                            alt={reply.authorName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {reply.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
