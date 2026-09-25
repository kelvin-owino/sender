import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Plus,
  FileText,
  Share2,
  Play,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { JobApplication, ApplicationStatus, JobPlatform } from '../types/job';

interface ApplicationsTableProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onOpenFollowUpModal: (app: JobApplication) => void;
  onOpenAddJobModal: () => void;
  onOpenResumeModal?: () => void;
  onOpenAccountsModal?: () => void;
  onTriggerAutoApplyRunner?: () => void;
  onOpenExportModal?: () => void;
  onVerifyCompany?: (app: JobApplication) => void;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onOpenFollowUpModal,
  onOpenAddJobModal,
  onOpenResumeModal,
  onOpenAccountsModal,
  onTriggerAutoApplyRunner,
  onOpenExportModal,
  onVerifyCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'match' | 'company'>('date');

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.recruiterName && app.recruiterName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'interviewing') {
      return app.status === 'interview_request' || app.status === 'technical_interview' || app.status === 'offer';
    }
    if (statusFilter === 'follow_up') {
      return app.status === 'follow_up_scheduled' || app.status === 'follow_up_sent';
    }
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    if (platformFilter !== 'all' && app.platform !== platformFilter) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'match') {
      return b.matchScore - a.matchScore;
    }
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'interview_request':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Interview Request
          </span>
        );
      case 'technical_interview':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Technical Round
          </span>
        );
      case 'offer':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Offer Extended 🏆
          </span>
        );
      case 'follow_up_sent':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300">
            <Mail className="w-3 h-3 text-indigo-400" />
            Follow-up Sent
          </span>
        );
      case 'viewed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-300">
            <Eye className="w-3 h-3 text-sky-400" />
            Profile Viewed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <XCircle className="w-3 h-3 text-slate-500" />
            Role Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters, Search & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, role title, recruiter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Segmented */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setStatusFilter('interviewing')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'interviewing'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interviews (
              {applications.filter((a) => a.status === 'interview_request' || a.status === 'technical_interview').length}
              )
            </button>
            <button
              onClick={() => setStatusFilter('follow_up')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'follow_up' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Follow-ups
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="date">Sort: Most Recent</option>
            <option value="match">Sort: Highest Match %</option>
            <option value="company">Sort: Company A-Z</option>
          </select>

          {/* Export Data Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              title="Export applications and state (CSV, JSON, Recruiter contacts)"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export</span>
            </button>
          )}

          {/* Add Job CTA */}
          <button
            onClick={onOpenAddJobModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Job</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/60">
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Compatibility</th>
                <th className="py-3 px-4">Dispatched</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Follow-up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Your Pipeline is Fresh & Ready</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          All mock data has been cleared. You can upload your own resume, connect your job accounts, or launch your first auto-apply dispatch.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {onOpenResumeModal && (
                          <button
                            onClick={onOpenResumeModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>1. Upload Resume</span>
                          </button>
                        )}
                        {onOpenAccountsModal && (
                          <button
                            onClick={onOpenAccountsModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>2. Connect Channels</span>
                          </button>
                        )}
                        {onTriggerAutoApplyRunner && (
                          <button
                            onClick={onTriggerAutoApplyRunner}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                            <span>3. Auto-Apply Run</span>
                          </button>
                        )}
                        <button
                          onClick={onOpenAddJobModal}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Track a Job Manually</span>
                        </button>
                        {onOpenExportModal && (
                          <button
                            onClick={onOpenExportModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Export Data</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Company & Role */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 group-hover:border-indigo-500 transition-colors">
                          {app.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5 flex-wrap">
                            <span>{app.company}</span>
                            {/* Real Company Verification Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerifyCompany?.(app);
                              }}
                              title="Verified Real Employer · Click to inspect corporate credentials & live job requisition"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/80 transition-colors"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </button>
                            {app.atsConfirmationId && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                #{app.atsConfirmationId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-md flex-wrap mt-0.5">
                            <span>{app.jobTitle}</span>
                            {app.resumeVersionName && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-1 bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-900/40">
                                  <FileText className="w-2.5 h-2.5 text-indigo-400" />
                                  <span>{app.resumeVersionName}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-300 uppercase">
                        {app.platform === 'linkedin' ? 'LinkedIn' : app.platform}
                      </span>
                    </td>

                    {/* Match Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              app.matchScore >= 90
                                ? 'bg-emerald-400'
                                : app.matchScore >= 80
                                ? 'bg-indigo-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${app.matchScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {app.matchScore}%
                        </span>
                      </div>
                    </td>

                    {/* Date Applied */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{new Date(app.appliedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-500">
                        {Math.max(0, Math.floor((Date.now() - new Date(app.appliedDate).getTime()) / (1000 * 3600 * 24)))}{' '}
                        days ago
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>

                    {/* Follow-up Indicator */}
                    <td className="py-3 px-4">
                      {app.followUpSentDate ? (
                        <span className="text-[11px] text-emerald-400 font-medium">Sent ✓</span>
                      ) : app.status === 'rejected' ? (
                        <span className="text-[11px] text-slate-500">N/A</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFollowUpModal(app);
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Send Follow-Up</span>
                        </button>
                      )}
                    </td>

                    {/* Row Quick Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
