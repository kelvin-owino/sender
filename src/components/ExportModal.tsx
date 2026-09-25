import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Users,
  FileText,
  CheckCircle2,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  JobApplication,
  CandidateProfile,
  JobFilterConfig,
  ConnectedAccount,
  NotificationItem,
  DispatchLogEntry,
} from '../types/job';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  profile: CandidateProfile;
  accounts: ConnectedAccount[];
  filterConfig: JobFilterConfig;
  notifications: NotificationItem[];
  dispatchLogs: DispatchLogEntry[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  applications,
  profile,
  accounts,
  filterConfig,
  notifications,
  dispatchLogs,
  onShowToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'recruiters' | 'summary'>('csv');
  const [includeCoverLetters, setIncludeCoverLetters] = useState(true);

  if (!isOpen) return null;

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      onShowToast('Pipeline Empty', 'No applications to export yet. Dispatched jobs will appear here.', 'info');
    }

    const headers = [
      'Company',
      'Job Title',
      'Resume Version Used',
      'Platform',
      'Status',
      'Match Score (%)',
      'Applied Date',
      'ATS Confirmation Code',
      'Company Domain',
      'Careers URL',
      'Recruiter Name',
      'Recruiter Email',
      'Recruiter Title',
      'Follow-up Due Date',
      'Follow-up Sent Date',
      'Notes',
      ...(includeCoverLetters ? ['Tailored Cover Letter'] : []),
    ];

    const rows = applications.map((a) => {
      const row = [
        `"${a.company.replace(/"/g, '""')}"`,
        `"${a.jobTitle.replace(/"/g, '""')}"`,
        `"${(a.resumeVersionName || 'Primary Resume').replace(/"/g, '""')}"`,
        a.platform,
        a.status,
        a.matchScore,
        new Date(a.appliedDate).toISOString(),
        `"${a.atsConfirmationId || ''}"`,
        `"${a.companyDomain || ''}"`,
        `"${a.jobUrl || ''}"`,
        `"${(a.recruiterName || '').replace(/"/g, '""')}"`,
        `"${a.recruiterEmail || ''}"`,
        `"${(a.recruiterTitle || '').replace(/"/g, '""')}"`,
        a.followUpDueDate ? new Date(a.followUpDueDate).toLocaleDateString() : '',
        a.followUpSentDate ? new Date(a.followUpSentDate).toLocaleDateString() : '',
        `"${(a.notes || '').replace(/"/g, '""')}"`,
      ];

      if (includeCoverLetters) {
        row.push(`"${(a.tailoredCoverLetter || '').replace(/"/g, '""')}"`);
      }

      return row;
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `sendaway-applications-${timestamp}.csv`, 'text/csv');
    onShowToast('Export Successful', `Exported ${applications.length} applications to CSV`, 'success');
    onClose();
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      generator: 'Sendaway Autonomous Job Application Platform',
      version: '2.0',
      profile,
      accounts,
      filterConfig,
      applications,
      notifications,
      dispatchLogs,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(jsonString, `sendaway-full-backup-${timestamp}.json`, 'application/json');
    onShowToast('Export Successful', 'Full account and application state backup exported to JSON', 'success');
    onClose();
  };

  const handleExportRecruiters = () => {
    const contacts = applications
      .filter((a) => a.recruiterEmail || a.recruiterName)
      .map((a) => [
        `"${(a.recruiterName || 'Talent Acquisition').replace(/"/g, '""')}"`,
        `"${a.recruiterEmail || ''}"`,
        `"${a.company.replace(/"/g, '""')}"`,
        `"${a.jobTitle.replace(/"/g, '""')}"`,
        a.platform,
        new Date(a.appliedDate).toLocaleDateString(),
        a.status,
      ]);

    const headers = ['Recruiter Name', 'Email Address', 'Company', 'Role', 'Platform', 'Application Date', 'Status'];
    const csvContent = [headers.join(','), ...contacts.map((r) => r.join(','))].join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `sendaway-recruiter-contacts-${timestamp}.csv`, 'text/csv');
    onShowToast('Export Successful', `Exported ${contacts.length} recruiter contacts to CSV`, 'success');
    onClose();
  };

  const handleExportSummary = () => {
    const lines: string[] = [];
    lines.push('================================================================');
    lines.push('           SENDAWAY JOB APPLICATION DISPATCH REPORT');
    lines.push(`               Generated: ${new Date().toLocaleString()}`);
    lines.push('================================================================\n');

    lines.push(`CANDIDATE: ${profile.fullName || 'Not specified'}`);
    lines.push(`TARGET ROLES: ${profile.targetTitles.join(', ') || 'Any'}`);
    lines.push(`TOTAL APPLICATIONS LOGGED: ${applications.length}`);
    lines.push(`CONNECTED CHANNELS: ${accounts.filter((a) => a.connected).map((a) => a.name).join(', ') || 'None'}\n`);

    lines.push('----------------------------------------------------------------');
    lines.push('STATUS SUMMARY:');
    const statuses = ['applied', 'viewed', 'interview_request', 'technical_interview', 'offer', 'rejected'];
    statuses.forEach((s) => {
      const count = applications.filter((a) => a.status === s).length;
      lines.push(`- ${s.replace(/_/g, ' ').toUpperCase()}: ${count}`);
    });
    lines.push('----------------------------------------------------------------\n');

    lines.push('DETAILED APPLICATION RECORDS:');
    applications.forEach((app, idx) => {
      lines.push(`\n[${idx + 1}] ${app.company.toUpperCase()} - ${app.jobTitle}`);
      lines.push(`    Status: ${app.status.toUpperCase()} | Match: ${app.matchScore}% | Resume: ${app.resumeVersionName || 'Primary'}`);
      lines.push(`    Platform: ${app.platform.toUpperCase()} | ATS Ref: ${app.atsConfirmationId || 'N/A'}`);
      lines.push(`    Applied On: ${new Date(app.appliedDate).toLocaleDateString()}`);
      lines.push(`    Recruiter: ${app.recruiterName || 'Talent Team'} (${app.recruiterEmail || 'direct careers portal'})`);
      lines.push(`    Job Link: ${app.jobUrl}`);
      if (app.notes) lines.push(`    Notes: ${app.notes}`);
    });

    const reportContent = lines.join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(reportContent, `sendaway-audit-summary-${timestamp}.txt`, 'text/plain');
    onShowToast('Summary Exported', 'Human-readable application summary downloaded', 'success');
    onClose();
  };

  const executeExport = () => {
    switch (selectedFormat) {
      case 'csv':
        handleExportCSV();
        break;
      case 'json':
        handleExportJSON();
        break;
      case 'recruiters':
        handleExportRecruiters();
        break;
      case 'summary':
        handleExportSummary();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Application Data</h2>
              <p className="text-xs text-slate-400">
                Download your application logs, recruiter directory, and account backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Choose Export Format</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSV Option */}
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                selectedFormat === 'csv'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                {selectedFormat === 'csv' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="font-bold text-white text-xs">Spreadsheet (CSV)</div>
              <div className="text-[11px] text-slate-400">
                All applications, status, ATS codes, and recruiter info for Excel / Sheets.
              </div>
            </button>

            {/* JSON Backup Option */}
            <button
              onClick={() => setSelectedFormat('json')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                selectedFormat === 'json'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileCode className="w-5 h-5 text-cyan-400" />
                {selectedFormat === 'json' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="font-bold text-white text-xs">Complete Backup (JSON)</div>
              <div className="text-[11px] text-slate-400">
                Full machine-readable backup of profile, accounts, filters, and records.
              </div>
            </button>

            {/* Recruiter Contacts Option */}
            <button
              onClick={() => setSelectedFormat('recruiters')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                selectedFormat === 'recruiters'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-purple-400" />
                {selectedFormat === 'recruiters' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="font-bold text-white text-xs">Recruiter Directory</div>
              <div className="text-[11px] text-slate-400">
                Direct hiring contacts, verified company emails, and follow-up history.
              </div>
            </button>

            {/* Human Readable Summary */}
            <button
              onClick={() => setSelectedFormat('summary')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                selectedFormat === 'summary'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-amber-400" />
                {selectedFormat === 'summary' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="font-bold text-white text-xs">Audit Summary (TXT)</div>
              <div className="text-[11px] text-slate-400">
                Formatted executive summary with interview statistics and timeline log.
              </div>
            </button>
          </div>

          {/* Additional Options */}
          {selectedFormat === 'csv' && (
            <label className="flex items-center gap-2.5 p-3 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeCoverLetters}
                onChange={(e) => setIncludeCoverLetters(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span>Include full generated cover letter text in CSV column</span>
            </label>
          )}

          {/* Quick Metrics */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span>Ready to export:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {applications.length} Applications · {accounts.length} Accounts · {dispatchLogs.length} Events
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={executeExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
