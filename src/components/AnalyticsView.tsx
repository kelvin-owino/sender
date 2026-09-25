import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Zap,
  Award,
} from 'lucide-react';
import { JobApplication } from '../types/job';

interface AnalyticsViewProps {
  applications: JobApplication[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenExportModal?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  applications,
  onShowToast,
  onOpenExportModal,
}) => {
  const total = applications.length;
  const interviews = applications.filter(
    (a) => a.status === 'interview_request' || a.status === 'technical_interview' || a.status === 'offer',
  ).length;
  const interviewRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : '0';
  const viewed = applications.filter((a) => a.status === 'viewed' || a.status === 'interview_request' || a.status === 'technical_interview' || a.status === 'offer').length;
  const followUpsSent = applications.filter((a) => !!a.followUpSentDate).length;
  const avgMatch = total > 0 ? (applications.reduce((acc, curr) => acc + curr.matchScore, 0) / total).toFixed(1) : '0';

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = [
      'Company',
      'Job Title',
      'Platform',
      'Match Score',
      'Status',
      'Applied Date',
      'Recruiter Name',
      'Recruiter Email',
      'ATS Confirmation',
      'Follow-up Sent',
    ];
    const rows = applications.map((a) => [
      `"${a.company}"`,
      `"${a.jobTitle}"`,
      a.platform,
      `${a.matchScore}%`,
      a.status,
      new Date(a.appliedDate).toLocaleDateString(),
      `"${a.recruiterName || ''}"`,
      a.recruiterEmail || '',
      a.atsConfirmationId || '',
      a.followUpSentDate ? new Date(a.followUpSentDate).toLocaleDateString() : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sendaway_Job_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Report Exported', 'CSV downloaded with detailed application progress', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Application Performance & Funnel Reports</h2>
          <p className="text-xs text-slate-400">
            Real-time conversion metrics across all connected accounts and job boards
          </p>
        </div>
        <button
          onClick={onOpenExportModal || handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Reports & Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400">Total Applications</div>
          <div className="text-2xl font-bold text-white mt-1">{total}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">100% automated dispatch</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400">Interview Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{interviewRate}%</div>
          <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Industry avg: ~3.2%</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400">Active Interviews</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{interviews}</div>
          <div className="text-[10px] text-cyan-500/80 mt-1 font-mono">In evaluation rounds</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400">Follow-Ups Sent</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{followUpsSent}</div>
          <div className="text-[10px] text-indigo-500/80 mt-1 font-mono">Dispatched on Day 5</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-slate-400">Avg Compatibility</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{avgMatch}%</div>
          <div className="text-[10px] text-purple-500/80 mt-1 font-mono">ATS skill overlap</div>
        </div>
      </div>

      {/* Funnel & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Pipeline Conversion Funnel
            </span>
            <span className="text-[11px] text-slate-400">All-time</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">1. Applications Dispatched</span>
                <span className="font-mono text-white">{total} (100%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">2. Resumes Opened / Viewed</span>
                <span className="font-mono text-white">
                  {viewed} ({total > 0 ? Math.round((viewed / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${total > 0 ? (viewed / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">3. Follow-ups Dispatched</span>
                <span className="font-mono text-white">
                  {followUpsSent} ({total > 0 ? Math.round((followUpsSent / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${total > 0 ? (followUpsSent / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-emerald-400 font-semibold">4. Interview Requests Received</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {interviews} ({interviewRate}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${total > 0 ? (interviews / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Share Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Source Platform Distribution
            </span>
            <span className="text-[11px] text-slate-400">Response distribution</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Greenhouse & Direct ATS', count: applications.filter((a) => a.platform === 'greenhouse').length, color: 'bg-emerald-500' },
              { label: 'LinkedIn Easy Apply', count: applications.filter((a) => a.platform === 'linkedin').length, color: 'bg-[#0A66C2]' },
              { label: 'Lever ATS', count: applications.filter((a) => a.platform === 'lever').length, color: 'bg-cyan-500' },
              { label: 'Workday Careers', count: applications.filter((a) => a.platform === 'workday').length, color: 'bg-purple-500' },
              { label: 'Direct Recruiter Email', count: applications.filter((a) => a.platform === 'direct_email').length, color: 'bg-rose-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-300">
                    {item.count} jobs ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
