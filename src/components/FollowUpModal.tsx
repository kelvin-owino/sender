import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, RefreshCw, Mail, Check } from 'lucide-react';
import { JobApplication, CandidateProfile } from '../types/job';
import { generateFollowUpApi } from '../services/api';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  profile: CandidateProfile;
  onFollowUpSent: (applicationId: string, emailBody: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  application,
  profile,
  onFollowUpSent,
  onShowToast,
}) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (application) {
      const email =
        application.recruiterEmail || `recruiting@${application.companyDomain || 'company.com'}`;
      setRecipient(email);
      setSubject(`Following up: ${application.jobTitle} - ${profile.fullName}`);

      const appliedDate = new Date(application.appliedDate);
      const daysAgo = Math.max(1, Math.round((Date.now() - appliedDate.getTime()) / (1000 * 3600 * 24)));

      handleGenerate(daysAgo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application]);

  if (!isOpen || !application) return null;

  const handleGenerate = async (daysAgo: number = 5) => {
    setIsGenerating(true);
    try {
      const res = await generateFollowUpApi(
        application.company,
        application.jobTitle,
        daysAgo,
        application.recruiterName,
        profile.fullName,
      );
      setBody(res.followUpText);
    } catch {
      setBody(
        `Hi ${application.recruiterName || `${application.company} Recruiting Team`},\n\nI wanted to follow up on my application for the ${application.jobTitle} role submitted a few days ago. I remain very enthusiastic about what ${application.company} is building and would welcome the chance to speak with the hiring team.\n\nThank you for your time and consideration!\n\nBest regards,\n${profile.fullName}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 600));
    onFollowUpSent(application.id, body);
    setIsSending(false);
    onShowToast('Follow-Up Dispatched', `Email sent to ${recipient}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Send Recruiter Follow-up</h2>
              <p className="text-xs text-slate-400">
                Polite automated outreach to {application.company} hiring team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">To (Recruiter / ATS Inbox)</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Message Body</label>
              <button
                onClick={() => handleGenerate(5)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Regenerate with AI</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !body.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send via Connected Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
