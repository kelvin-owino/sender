import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CandidateProfile,
  ConnectedAccount,
  JobFilterConfig,
  JobApplication,
  NotificationItem,
  DispatchLogEntry,
  ApplicationStatus,
} from './types/job';
import {
  INITIAL_PROFILE,
  INITIAL_ACCOUNTS,
  INITIAL_FILTER_CONFIG,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISPATCH_LOGS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { ApplicationsTable } from './components/ApplicationsTable';
import { ApplicationsKanban } from './components/ApplicationsKanban';
import { AnalyticsView } from './components/AnalyticsView';
import { DispatchLogView } from './components/DispatchLogView';
import { ResumeModal } from './components/ResumeModal';
import { AccountsModal } from './components/AccountsModal';
import { FiltersModal } from './components/FiltersModal';
import { AutoApplyRunnerModal } from './components/AutoApplyRunnerModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { FollowUpModal } from './components/FollowUpModal';
import { AddJobModal } from './components/AddJobModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ExportModal } from './components/ExportModal';
import { CompanyVerificationModal } from './components/CompanyVerificationModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const STORAGE_PREFIX = 'sendaway_clean_v1_';

const safeStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },
  set(key: string, value: unknown): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota or security error
    }
  },
  clear(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.clear();
    } catch {
      // ignore
    }
  }
};

// Safe storage initialization
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(`${STORAGE_PREFIX}initialized`)) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sendaway_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(`${STORAGE_PREFIX}initialized`, 'true');
    }
  } catch {
    // ignore
  }
}

export default function App() {
  // Persistent state initialized from localStorage or clean defaults
  const [profile, setProfile] = useState<CandidateProfile>(() => safeStorage.get(`${STORAGE_PREFIX}profile`, INITIAL_PROFILE));
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(() => safeStorage.get(`${STORAGE_PREFIX}accounts`, INITIAL_ACCOUNTS));
  const [filterConfig, setFilterConfig] = useState<JobFilterConfig>(() => safeStorage.get(`${STORAGE_PREFIX}filters`, INITIAL_FILTER_CONFIG));
  const [applications, setApplications] = useState<JobApplication[]>(() => safeStorage.get(`${STORAGE_PREFIX}applications`, INITIAL_APPLICATIONS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => safeStorage.get(`${STORAGE_PREFIX}notifications`, INITIAL_NOTIFICATIONS));
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogEntry[]>(() => safeStorage.get(`${STORAGE_PREFIX}logs`, INITIAL_DISPATCH_LOGS));

  const [autoApplyActive, setAutoApplyActive] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'kanban' | 'analytics' | 'logs'>('table');

  // Modals state
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isAutoApplyRunnerOpen, setIsAutoApplyRunnerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [verificationApp, setVerificationApp] = useState<JobApplication | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [followUpApp, setFollowUpApp] = useState<JobApplication | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to storage safely
  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}profile`, profile);
  }, [profile]);

  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}accounts`, accounts);
  }, [accounts]);

  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}filters`, filterConfig);
  }, [filterConfig]);

  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}applications`, applications);
  }, [applications]);

  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}notifications`, notifications);
  }, [notifications]);

  useEffect(() => {
    safeStorage.set(`${STORAGE_PREFIX}logs`, dispatchLogs);
  }, [dispatchLogs]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleResetAll = () => {
    if (confirm('Clear everything and reset to an empty state for your own testing?')) {
      setProfile(INITIAL_PROFILE);
      setAccounts(INITIAL_ACCOUNTS);
      setFilterConfig(INITIAL_FILTER_CONFIG);
      setApplications([]);
      setNotifications([]);
      setDispatchLogs([]);
      safeStorage.clear();
      showToast('All Cleared', 'Sendaway is completely reset to a clean slate', 'info');
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Status updates
  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const isInterview = newStatus === 'interview_request' || newStatus === 'technical_interview' || newStatus === 'offer';
          if (isInterview) {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            } catch {
              // non-fatal
            }
          }

          const newTimelineEvent = {
            id: `tl-${Date.now()}`,
            type: (isInterview ? 'interview_invite' : 'status_change') as any,
            title: `Status Updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
            description: `Application stage changed to ${newStatus.replace(/_/g, ' ')}.`,
            timestamp: new Date().toISOString(),
          };

          return {
            ...app,
            status: newStatus,
            timeline: [newTimelineEvent, ...app.timeline],
          };
        }
        return app;
      }),
    );

    // Also update selectedApplication if currently open
    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdateNotes = (appId: string, notes: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, notes } : app)),
    );
    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleUpdateResumeVersion = (appId: string, versionId: string, versionName: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newTimelineEvent = {
            id: `tl-rv-${Date.now()}`,
            type: 'status_change' as const,
            title: `Resume Version Changed: ${versionName}`,
            description: `Attached resume version switched to "${versionName}".`,
            timestamp: new Date().toISOString(),
          };
          return {
            ...app,
            resumeVersionId: versionId,
            resumeVersionName: versionName,
            timeline: [newTimelineEvent, ...app.timeline],
          };
        }
        return app;
      }),
    );

    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication((prev) =>
        prev ? { ...prev, resumeVersionId: versionId, resumeVersionName: versionName } : null,
      );
    }
    showToast('Resume Version Updated', `Application now uses "${versionName}"`, 'success');
  };

  const handleDeleteApplication = (appId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication(null);
    }
    showToast('Application Removed', 'Job application removed from tracking', 'info');
  };

  const handleFollowUpSent = (appId: string, emailBody: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const followUpEvent = {
            id: `tl-fu-${Date.now()}`,
            type: 'follow_up' as const,
            title: 'Recruiter Follow-up Sent',
            description: `Personalized follow-up email dispatched to recruiter inbox.`,
            timestamp: new Date().toISOString(),
          };
          return {
            ...app,
            status: 'follow_up_sent',
            followUpSentDate: new Date().toISOString(),
            timeline: [followUpEvent, ...app.timeline],
          };
        }
        return app;
      }),
    );

    // Update connected accounts email quota
    setAccounts((prev) =>
      prev.map((acc) => (acc.type === 'direct_email' ? { ...acc, dailyUsed: acc.dailyUsed + 1 } : acc)),
    );

    // Add log entry
    const matched = applications.find((a) => a.id === appId);
    if (matched) {
      const newLog: DispatchLogEntry = {
        id: `log-fu-${Date.now()}`,
        timestamp: new Date().toISOString(),
        company: matched.company,
        jobTitle: matched.jobTitle,
        platform: 'direct_email',
        matchScore: matched.matchScore,
        status: 'success',
        details: `Follow-up email dispatched to ${matched.recruiterEmail || 'hiring team'}`,
      };
      setDispatchLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleApplicationsCreated = (newApps: JobApplication[], newLogs: DispatchLogEntry[]) => {
    setApplications((prev) => [...newApps, ...prev]);
    setDispatchLogs((prev) => [...newLogs, ...prev]);

    // Update account usage
    setAccounts((prev) =>
      prev.map((acc) => {
        const countForPlatform = newApps.filter((a) => a.platform === acc.type).length;
        return {
          ...acc,
          dailyUsed: acc.dailyUsed + countForPlatform,
        };
      }),
    );

    // Add notification
    if (newApps.length > 0) {
      const notif: NotificationItem = {
        id: `notif-apply-${Date.now()}`,
        company: newApps[0].company,
        jobTitle: newApps[0].jobTitle,
        type: 'auto_applied',
        title: `Auto-Applied to ${newApps.length} Openings`,
        message: `Successfully sent tailored applications to ${newApps.map((a) => a.company).join(', ')}.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Simulators for testing real-time notifications
  const simulateInterviewRequest = () => {
    const companies = ['Anthropic', 'Linear', 'Stripe', 'Figma', 'Datadog'];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const existing = applications.find((a) => a.company.toLowerCase().includes(randomCompany.toLowerCase())) || applications[0];

    if (existing) {
      handleUpdateStatus(existing.id, 'interview_request');
      const newNotif: NotificationItem = {
        id: `notif-sim-int-${Date.now()}`,
        applicationId: existing.id,
        company: existing.company,
        jobTitle: existing.jobTitle,
        type: 'interview_request',
        title: `🎉 Interview Request from ${existing.company}`,
        message: `Hiring team replied: "Your profile matches our team needs. When are you free for a 30-min conversation?"`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast('Interview Request Received!', `Hiring team at ${existing.company} requested a call`, 'success');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {
        // non-fatal
      }
    }
  };

  const simulateRejectionUpdate = () => {
    const existing = applications.find((a) => a.status === 'applied' || a.status === 'viewed') || applications[applications.length - 1];
    if (existing) {
      handleUpdateStatus(existing.id, 'rejected');
      const newNotif: NotificationItem = {
        id: `notif-sim-rej-${Date.now()}`,
        applicationId: existing.id,
        company: existing.company,
        jobTitle: existing.jobTitle,
        type: 'rejection',
        title: `Update on ${existing.jobTitle} at ${existing.company}`,
        message: `Automated notice parsed: "The role has been filled. We will keep your resume on file."`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast('Status Update Received', `${existing.company} marked role as closed`, 'info');
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const todayAppliedCount = accounts.reduce((acc, curr) => acc + curr.dailyUsed, 0);
  const totalDailyQuota = accounts.reduce((acc, curr) => acc + curr.dailyQuota, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        accounts={accounts}
        filterConfig={filterConfig}
        autoApplyActive={autoApplyActive}
        onToggleAutoApply={() => {
          setAutoApplyActive(!autoApplyActive);
          showToast(
            !autoApplyActive ? 'Auto-Apply Activated' : 'Auto-Apply Paused',
            !autoApplyActive
              ? 'Sendaway will scan and dispatch matching jobs automatically'
              : 'Autonomous dispatching is paused',
            !autoApplyActive ? 'success' : 'info',
          );
        }}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
        onOpenFiltersModal={() => setIsFiltersModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
        onTriggerAutoApplyRunner={() => setIsAutoApplyRunnerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetAllData={handleResetAll}
        unreadNotificationsCount={unreadNotifsCount}
        currentView={currentView}
        onSelectView={setCurrentView}
        todayAppliedCount={todayAppliedCount}
        totalDailyQuota={totalDailyQuota}
        totalApplicationsCount={applications.length}
        activeInterviewsCount={
          applications.filter(
            (a) => a.status === 'interview_request' || a.status === 'technical_interview',
          ).length
        }
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Testing Guide Banner for Fresh Slate */}
        {(!profile.fullName.trim() || !accounts.some((a) => a.connected)) && (
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-900/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">Testing Environment Ready</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">Clean Slate</span>
              </div>
              <p className="text-slate-300 text-xs">
                All pre-existing mock items were removed. You can now test uploading your resume, linking your job accounts, and launching the auto-apply engine on your own terms.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
              >
                <span>1. Upload Resume</span>
              </button>
              <button
                onClick={() => setIsAccountsModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition-colors"
              >
                <span>2. Connect Accounts</span>
              </button>
              <button
                onClick={() => setIsAutoApplyRunnerOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/25 transition-all"
              >
                <span>3. Run Auto-Apply</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-medium transition-colors"
              >
                <span>Export Data</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switcher Output */}
        {currentView === 'table' && (
          <ApplicationsTable
            applications={applications}
            onSelectApplication={setSelectedApplication}
            onUpdateStatus={handleUpdateStatus}
            onOpenFollowUpModal={setFollowUpApp}
            onOpenAddJobModal={() => setIsAddJobModalOpen(true)}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
            onTriggerAutoApplyRunner={() => setIsAutoApplyRunnerOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onVerifyCompany={(app) => setVerificationApp(app)}
          />
        )}

        {currentView === 'kanban' && (
          <ApplicationsKanban
            applications={applications}
            onSelectApplication={setSelectedApplication}
            onUpdateStatus={handleUpdateStatus}
            onOpenFollowUpModal={setFollowUpApp}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            applications={applications}
            onShowToast={showToast}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {currentView === 'logs' && (
          <DispatchLogView logs={dispatchLogs} onClearLogs={() => setDispatchLogs([])} />
        )}
      </main>

      {/* Modals & Drawers */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onShowToast={showToast}
      />

      <AccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        accounts={accounts}
        onUpdateAccounts={setAccounts}
        onShowToast={showToast}
      />

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filterConfig={filterConfig}
        onSaveFilters={setFilterConfig}
        onShowToast={showToast}
      />

      <AutoApplyRunnerModal
        isOpen={isAutoApplyRunnerOpen}
        onClose={() => setIsAutoApplyRunnerOpen(false)}
        profile={profile}
        filterConfig={filterConfig}
        onApplicationsCreated={handleApplicationsCreated}
        onShowToast={showToast}
      />

      <ApplicationDetailModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        profile={profile}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
        onUpdateResumeVersion={handleUpdateResumeVersion}
        onOpenFollowUpModal={(app) => {
          setSelectedApplication(null);
          setFollowUpApp(app);
        }}
        onDeleteApplication={handleDeleteApplication}
        onShowToast={showToast}
        onVerifyCompany={(app) => setVerificationApp(app)}
      />

      <FollowUpModal
        isOpen={!!followUpApp}
        onClose={() => setFollowUpApp(null)}
        application={followUpApp}
        profile={profile}
        onFollowUpSent={handleFollowUpSent}
        onShowToast={showToast}
      />

      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        profile={profile}
        onAddApplication={(newApp) => {
          setApplications((prev) => [newApp, ...prev]);
        }}
        onShowToast={showToast}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        applications={applications}
        profile={profile}
        accounts={accounts}
        filterConfig={filterConfig}
        notifications={notifications}
        dispatchLogs={dispatchLogs}
        onShowToast={showToast}
      />

      <CompanyVerificationModal
        isOpen={!!verificationApp}
        onClose={() => setVerificationApp(null)}
        application={verificationApp}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        applications={applications}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
          );
        }}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          showToast('Notifications Marked Read', undefined, 'info');
        }}
        onSelectApplication={(app) => setSelectedApplication(app)}
        onSimulateInterview={simulateInterviewRequest}
        onSimulateRejection={simulateRejectionUpdate}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
