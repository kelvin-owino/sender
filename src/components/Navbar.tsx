import React, { useState } from 'react';
import {
  Send,
  FileText,
  SlidersHorizontal,
  Bell,
  Play,
  Share2,
  LayoutList,
  Columns3,
  BarChart3,
  Terminal,
  User,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Download,
} from 'lucide-react';
import { CandidateProfile, ConnectedAccount, JobFilterConfig } from '../types/job';

interface NavbarProps {
  profile: CandidateProfile;
  accounts: ConnectedAccount[];
  filterConfig: JobFilterConfig;
  autoApplyActive: boolean;
  onToggleAutoApply: () => void;
  onOpenResumeModal: () => void;
  onOpenAccountsModal: () => void;
  onOpenFiltersModal: () => void;
  onOpenNotifications: () => void;
  onOpenAddJobModal: () => void;
  onTriggerAutoApplyRunner: () => void;
  onOpenExportModal?: () => void;
  onResetAllData?: () => void;
  unreadNotificationsCount: number;
  currentView: 'table' | 'kanban' | 'analytics' | 'logs';
  onSelectView: (view: 'table' | 'kanban' | 'analytics' | 'logs') => void;
  todayAppliedCount: number;
  totalDailyQuota: number;
  totalApplicationsCount: number;
  activeInterviewsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  accounts,
  filterConfig,
  autoApplyActive,
  onToggleAutoApply,
  onOpenResumeModal,
  onOpenAccountsModal,
  onOpenFiltersModal,
  onOpenNotifications,
  onOpenAddJobModal,
  onTriggerAutoApplyRunner,
  onOpenExportModal,
  onResetAllData,
  unreadNotificationsCount,
  currentView,
  onSelectView,
  todayAppliedCount,
  totalDailyQuota,
  totalApplicationsCount,
  activeInterviewsCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const connectedCount = accounts.filter((a) => a.connected).length;
  const hasProfile = Boolean(profile.fullName.trim());
  const initials = hasProfile
    ? profile.fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Status Indicator */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-bold ring-1 ring-white/20">
                <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white font-mono">sendaway</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border bg-slate-900 border-slate-800">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        autoApplyActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
                      }`}
                    />
                    <span className={autoApplyActive ? 'text-emerald-400' : 'text-slate-400'}>
                      {autoApplyActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                  Automated Job Application Engine
                </div>
              </div>
            </div>

            {/* Main View Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800/90 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => onSelectView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'table'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Applications</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    currentView === 'table' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {totalApplicationsCount}
                </span>
              </button>

              <button
                onClick={() => onSelectView('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Kanban</span>
                {activeInterviewsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeInterviewsCount} int
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectView('analytics')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => onSelectView('logs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'logs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Profile Pill */}
            <button
              onClick={onOpenResumeModal}
              title="Edit Resume & Auto-fill Screening Profile"
              className={`flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border rounded-xl text-xs transition-all shadow-sm group ${
                hasProfile
                  ? 'border-slate-800 hover:border-slate-700 text-slate-200'
                  : 'border-indigo-500/60 text-indigo-300 ring-1 ring-indigo-500/30 bg-indigo-950/20'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                {initials ? initials : <FileText className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-[11px] font-semibold text-white leading-tight flex items-center gap-1">
                  <span>{hasProfile ? profile.fullName.split(' ')[0] : 'Upload Resume'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                  {hasProfile
                    ? profile.resumeVersions && profile.resumeVersions.length > 1
                      ? `${profile.resumeVersions.length} versions`
                      : 'Resume active'
                    : 'Click to add file'}
                </div>
              </div>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifications & Recruiter Updates"
              className="relative p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md ring-2 ring-slate-950 animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Run Auto-Apply Action Button */}
            <button
              onClick={onTriggerAutoApplyRunner}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Run Auto-Apply</span>
              <span className="sm:hidden">Run</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Pipeline Control Strip (User Friendly Menu bar) */}
        <div className="py-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-2 shrink-0">
            {/* Autonomous Switch */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-[11px] text-slate-400">Auto-Dispatcher:</span>
              <button
                onClick={onToggleAutoApply}
                role="switch"
                aria-checked={autoApplyActive}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                  autoApplyActive ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoApplyActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="font-mono text-[11px] text-slate-300">
                {todayAppliedCount}/{totalDailyQuota} today
              </span>
            </div>

            {/* Connected Accounts Quick Access */}
            <button
              onClick={onOpenAccountsModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Accounts</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-800 text-cyan-300 rounded border border-cyan-800/50">
                {connectedCount} Active
              </span>
            </button>

            {/* Matching Criteria & Filters */}
            <button
              onClick={onOpenFiltersModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Filters</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-800 text-purple-300 rounded border border-purple-800/50">
                ≥{filterConfig.minMatchScore}% Match
              </span>
            </button>

            {/* Target Role Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 border border-slate-800/60 text-slate-400 rounded-lg text-[11px]">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target:</span>
              <span className="text-slate-200 font-medium truncate max-w-[160px]">
                {profile.targetTitles[0] || 'Upload resume to set'}
              </span>
            </div>
          </div>

          {/* Quick Track Manual Job, Export & Reset Option */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                title="Export applications and profile data (CSV / JSON / Recruiter directory)"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export</span>
              </button>
            )}

            {onResetAllData && (
              <button
                onClick={onResetAllData}
                title="Reset all applications, accounts, and profile data to blank slate"
                className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg text-[11px] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}

            <button
              onClick={onOpenAddJobModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track Job</span>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="text-[11px] font-mono uppercase text-slate-500 px-1">Navigation Views</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectView('table');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  currentView === 'table' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>Applications ({totalApplicationsCount})</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('kanban');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  currentView === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Columns3 className="w-4 h-4" />
                <span>Kanban Pipeline</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  currentView === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports & Funnel</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('logs');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  currentView === 'logs' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Live Feed</span>
              </button>
            </div>

            <div className="text-[11px] font-mono uppercase text-slate-500 px-1 pt-2">Settings & Configuration</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onOpenResumeModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs text-slate-200 border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Resume & Screening Profile</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profile.fullName.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenAccountsModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs text-slate-200 border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Connected Job Accounts</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {connectedCount} Connected
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenFiltersModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs text-slate-200 border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <span>Matching Criteria & Blacklist</span>
                </span>
                <span className="text-[11px] text-purple-400 font-mono">
                  ≥{filterConfig.minMatchScore}%
                </span>
              </button>

              {onOpenExportModal && (
                <button
                  onClick={() => {
                    onOpenExportModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs text-slate-200 border border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export Application Data</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    CSV / JSON
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
