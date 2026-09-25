import React from 'react';
import {
  Calendar,
  Mail,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types/job';

interface ApplicationsKanbanProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onOpenFollowUpModal: (app: JobApplication) => void;
}

interface ColumnDef {
  key: string;
  title: string;
  statuses: ApplicationStatus[];
  accentColor: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'applied',
    title: 'Dispatched & Applied',
    statuses: ['applied', 'queued'],
    accentColor: 'border-slate-700',
  },
  {
    key: 'viewed',
    title: 'Profile Viewed',
    statuses: ['viewed'],
    accentColor: 'border-sky-500/50',
  },
  {
    key: 'follow_up',
    title: 'Follow-Up In Progress',
    statuses: ['follow_up_scheduled', 'follow_up_sent'],
    accentColor: 'border-indigo-500/50',
  },
  {
    key: 'interviews',
    title: 'Interview Requests 🎉',
    statuses: ['interview_request', 'technical_interview'],
    accentColor: 'border-emerald-500/50',
  },
  {
    key: 'offers_closed',
    title: 'Offers & Archived',
    statuses: ['offer', 'rejected'],
    accentColor: 'border-purple-500/40',
  },
];

export const ApplicationsKanban: React.FC<ApplicationsKanbanProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onOpenFollowUpModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => col.statuses.includes(a.status));

        return (
          <div
            key={col.key}
            className={`bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[450px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">{col.title}</span>
              <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[70vh]">
              {colApps.length === 0 ? (
                <div className="text-center py-10 text-[11px] text-slate-600">No applications</div>
              ) : (
                colApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all duration-150 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5 truncate">
                          <span>{app.company}</span>
                          <span title="Verified Real Employer" className="text-emerald-400 shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{app.jobTitle}</div>
                        {app.resumeVersionName && (
                          <div className="mt-1 text-[10px] text-indigo-300 font-mono flex items-center gap-1 truncate">
                            <FileText className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{app.resumeVersionName}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded shrink-0 border border-indigo-900">
                        {app.matchScore}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-900">
                      <span className="uppercase font-mono">{app.platform}</span>
                      <span>
                        {Math.max(0, Math.floor((Date.now() - new Date(app.appliedDate).getTime()) / (1000 * 3600 * 24)))}{' '}
                        days ago
                      </span>
                    </div>

                    {/* Quick Follow-up Action if due */}
                    {!app.followUpSentDate && app.status !== 'rejected' && app.status !== 'offer' && (
                      <div className="mt-2 pt-1.5 border-t border-slate-900 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">Recruiter: {app.recruiterName?.split(' ')[0] || 'Team'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFollowUpModal(app);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Follow-up →
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
