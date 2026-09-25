import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Calendar,
  Clock,
  Send,
  Building,
  Briefcase,
  Layers,
  FileText,
  User,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { JobApplication, ApplicationStatus, CandidateProfile } from '../types/job';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  profile: CandidateProfile;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateResumeVersion?: (appId: string, versionId: string, versionName: string) => void;
  onOpenFollowUpModal: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onVerifyCompany?: (app: JobApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  profile,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateResumeVersion,
  onOpenFollowUpModal,
  onDeleteApplication,
  onShowToast,
  onVerifyCompany,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'letter' | 'recruiter' | 'notes'>('overview');
  const [notes, setNotes] = useState(application?.notes || '');
  const [copiedLetter, setCopiedLetter] = useState(false);

  if (!isOpen || !application) return null;

  const availableVersions =
    profile.resumeVersions && profile.resumeVersions.length > 0
      ? profile.resumeVersions
      : profile.rawResumeText
      ? [
          {
            id: 'rv-default',
            name: profile.targetTitles[0] ? `${profile.targetTitles[0]} Version` : 'Primary Resume',
            targetRole: profile.targetTitles[0] || 'Software Engineer',
            fileName: profile.resumeFileName || 'Resume.pdf',
            uploadedAt: new Date().toISOString(),
            rawText: profile.rawResumeText,
            skills: profile.primarySkills,
            isDefault: true,
          },
        ]
      : [];

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(application.tailoredCoverLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
    onShowToast('Copied to Clipboard', 'Cover letter text copied', 'info');
  };

  const handleSaveNotes = () => {
    onUpdateNotes(application.id, notes);
    onShowToast('Notes Saved', 'Candidate internal notes updated', 'success');
  };

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: 'applied', label: 'Applied (Dispatched)' },
    { value: 'viewed', label: 'Viewed by Recruiter' },
    { value: 'follow_up_scheduled', label: 'Follow-up Scheduled' },
    { value: 'follow_up_sent', label: 'Follow-up Sent' },
    { value: 'interview_request', label: '🎉 Interview Request' },
    { value: 'technical_interview', label: 'Technical / Onsite Round' },
    { value: 'offer', label: '🏆 Offer Extended' },
    { value: 'rejected', label: 'Rejected / Archived' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
              {application.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-white">{application.company}</h2>
                <button
                  type="button"
                  onClick={() => onVerifyCompany?.(application)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/80 transition-colors shadow-sm"
                  title="Inspect Real Employer Credentials, Corporate Domain & Live Requisition Board"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Real Company</span>
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {application.atsConfirmationId ? `ATS #${application.atsConfirmationId}` : ''}
                </span>
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                >
                  <span>Job Posting</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">{application.jobTitle}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>{application.location}</span>
                <span aria-hidden="true">·</span>
                <span>{application.salaryRange || 'Competitive'}</span>
                <span aria-hidden="true">·</span>
                <span>Via {application.platform.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400 font-medium">{application.matchScore}% Match</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Selector */}
            <div className="relative">
              <select
                value={application.status}
                onChange={(e) => {
                  onUpdateStatus(application.id, e.target.value as ApplicationStatus);
                  onShowToast('Status Updated', `Application moved to ${e.target.value}`, 'success');
                }}
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Timeline
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'letter'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tailored Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'recruiter'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recruiter & Follow-up
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Notes & Details
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Overview & Timeline */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Status</div>
                  <div className="text-xs font-semibold text-white capitalize mt-0.5">
                    {application.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Match Score</div>
                  <div className="text-xs font-semibold text-indigo-400 font-mono mt-0.5">
                    {application.matchScore}%
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Applied Date</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Follow-up Due</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {application.followUpSentDate
                      ? 'Follow-up Sent'
                      : application.followUpDueDate
                      ? new Date(application.followUpDueDate).toLocaleDateString()
                      : 'None'}
                  </div>
                </div>
              </div>

              {/* Resume Version Used & Switcher */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Resume Version Used</div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {application.resumeVersionName || 'Primary Resume'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400 whitespace-nowrap">Change Version:</label>
                  <select
                    value={application.resumeVersionId || ''}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const found = availableVersions.find((v) => v.id === vId);
                      if (found) {
                        onUpdateResumeVersion?.(application.id, found.id, found.name);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {availableVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                    {availableVersions.length === 0 && (
                      <option value="">Default System Resume</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Matched Skills */}
              <div>
                <div className="text-xs font-semibold text-white mb-2">Matched Competencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {application.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 rounded text-xs"
                    >
                      ✓ {s}
                    </span>
                  ))}
                  {application.missingSkills?.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs"
                    >
                      - {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="text-xs font-semibold text-white mb-3">Application Event Timeline</div>
                <div className="relative pl-6 space-y-4 border-l border-slate-800">
                  {application.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{event.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(event.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Tailored Cover Letter */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Tailored specifically for {application.company} and submitted with your application
                </div>
                <button
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                {application.tailoredCoverLetter}
              </div>
            </div>
          )}

          {/* TAB 3: Recruiter & Direct Follow-up */}
          {activeTab === 'recruiter' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {application.recruiterName || 'Talent Acquisition Team'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {application.recruiterTitle || `Recruiting Partner, ${application.company}`}
                    </div>
                    <div className="text-xs text-indigo-400 font-mono mt-1">
                      {application.recruiterEmail || `recruiting@${application.companyDomain || 'company.com'}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenFollowUpModal(application)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Follow-Up Email</span>
                </button>
              </div>

              {application.followUpSentDate ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    Follow-up was successfully sent on {new Date(application.followUpSentDate).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                  <span>Automated 5-Day Follow-Up Status:</span>
                  <span className="font-mono text-indigo-400">
                    {application.followUpDueDate
                      ? `Scheduled for ${new Date(application.followUpDueDate).toLocaleDateString()}`
                      : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Notes & Details */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Internal Candidate Notes & Interview Prep
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about calls, interview questions asked, follow-up thoughts..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Remove application to ${application.company}?`)) {
                onDeleteApplication(application.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Application</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
