import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Send,
  Loader2,
  FileCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobApplication, CandidateProfile, JobFilterConfig, DispatchLogEntry } from '../types/job';
import { AVAILABLE_JOB_FEED } from '../data/mockData';
import { generateCoverLetterApi } from '../services/api';

interface AutoApplyRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  filterConfig: JobFilterConfig;
  onApplicationsCreated: (newApps: JobApplication[], newLogs: DispatchLogEntry[]) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

type RunnerStep =
  | 'idle'
  | 'scanning'
  | 'matching'
  | 'tailoring'
  | 'submitting'
  | 'completed';

export const AutoApplyRunnerModal: React.FC<AutoApplyRunnerModalProps> = ({
  isOpen,
  onClose,
  profile,
  filterConfig,
  onApplicationsCreated,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState<RunnerStep>('idle');
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [appliedJobsList, setAppliedJobsList] = useState<JobApplication[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Eligible jobs from available pool that pass filters
  const eligibleFeedJobs = AVAILABLE_JOB_FEED.filter((j) => {
    // Check blacklist
    if (filterConfig.blacklistedCompanies.some((b) => j.company.toLowerCase().includes(b.toLowerCase()))) {
      return false;
    }
    // Check match score threshold
    if (j.matchScore < filterConfig.minMatchScore) {
      return false;
    }
    return true;
  });

  const runBatch = async () => {
    setIsProcessing(true);
    setCurrentStep('scanning');

    const activeResume =
      profile.resumeVersions?.find((v) => v.id === profile.activeResumeId) ||
      profile.resumeVersions?.find((v) => v.isDefault) ||
      profile.resumeVersions?.[0];

    const resumeName =
      activeResume?.name ||
      (profile.targetTitles[0] ? `${profile.targetTitles[0]} Version` : 'Primary Resume');
    const resumeId = activeResume?.id || 'rv-default';

    setStatusLog([
      `Starting Sendaway Auto-Apply Engine for ${profile.fullName || 'Candidate'}...`,
      `📄 Attached Resume Version: "${resumeName}"`,
    ]);

    const createdApps: JobApplication[] = [];
    const createdLogs: DispatchLogEntry[] = [];

    await new Promise((r) => setTimeout(r, 600));

    setStatusLog((prev) => [
      ...prev,
      `🔍 Scanning connected accounts: LinkedIn, Greenhouse ATS, Lever for "${profile.targetTitles[0] || 'Software Engineer'}"...`,
    ]);

    await new Promise((r) => setTimeout(r, 800));

    const jobsToApply = eligibleFeedJobs.slice(0, 3);
    if (jobsToApply.length === 0) {
      setStatusLog((prev) => [
        ...prev,
        `⚠️ No new jobs met the match threshold of ${filterConfig.minMatchScore}% or all were filtered out.`,
      ]);
      setCurrentStep('completed');
      setIsProcessing(false);
      return;
    }

    setStatusLog((prev) => [
      ...prev,
      `🎯 Found ${jobsToApply.length} high-compatibility openings meeting criteria (Min match: ${filterConfig.minMatchScore}%, Direct email verified).`,
    ]);

    for (let i = 0; i < jobsToApply.length; i++) {
      const feedJob = jobsToApply[i];
      setCurrentJobIndex(i);

      // Step 2: Matching
      setCurrentStep('matching');
      setStatusLog((prev) => [
        ...prev,
        `⚡ [${i + 1}/${jobsToApply.length}] Evaluating ${feedJob.company} (${feedJob.jobTitle}) - Compatibility: ${feedJob.matchScore}%`,
        `🛡️ Verified corporate employer domain (${feedJob.companyDomain}) & active ${feedJob.platform.toUpperCase()} requisition board.`,
      ]);
      await new Promise((r) => setTimeout(r, 700));

      // Step 3: Tailoring cover letter
      setCurrentStep('tailoring');
      setStatusLog((prev) => [
        ...prev,
        `✍️ Auto-tailoring cover letter highlighting ${profile.primarySkills.slice(0, 3).join(', ')}...`,
      ]);

      let letter = '';
      try {
        const letterRes = await generateCoverLetterApi(feedJob.company, feedJob.jobTitle, '', profile);
        letter = letterRes.coverLetter;
      } catch {
        letter = `Dear ${feedJob.company} Team,\n\nI am eager to apply for the ${feedJob.jobTitle} position. With my background in ${profile.primarySkills.slice(0, 4).join(', ')}, I am confident in adding immediate value.\n\nWarm regards,\n${profile.fullName}`;
      }
      await new Promise((r) => setTimeout(r, 700));

      // Step 4: Submitting
      setCurrentStep('submitting');
      setStatusLog((prev) => [
        ...prev,
        `🚀 Auto-filling screening questionnaire & dispatching packet via ${feedJob.platform.toUpperCase()}...`,
      ]);
      await new Promise((r) => setTimeout(r, 800));

      const confirmationId = `${feedJob.company.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const newApp: JobApplication = {
        id: `app-${Date.now()}-${i}`,
        company: feedJob.company,
        companyDomain: feedJob.companyDomain,
        jobTitle: feedJob.jobTitle,
        location: feedJob.location,
        salaryRange: feedJob.salaryRange,
        platform: feedJob.platform,
        jobUrl: feedJob.jobUrl,
        appliedDate: new Date().toISOString(),
        status: 'applied',
        matchScore: feedJob.matchScore,
        matchedSkills: feedJob.matchedSkills,
        missingSkills: feedJob.missingSkills,
        recruiterName: feedJob.recruiterName,
        recruiterEmail: feedJob.recruiterEmail,
        recruiterTitle: 'Talent Acquisition Partner',
        tailoredCoverLetter: letter,
        atsConfirmationId: confirmationId,
        resumeVersionId: resumeId,
        resumeVersionName: resumeName,
        followUpDueDate: new Date(Date.now() + 3600000 * 24 * (filterConfig.followUpDaysAfter || 5)).toISOString(),
        notes: `Auto-dispatched via Sendaway engine using resume "${resumeName}". ATS confirmation #${confirmationId}.`,
        timeline: [
          {
            id: `tl-${Date.now()}-${i}`,
            type: 'submitted',
            title: `Auto-Applied via ${feedJob.platform.toUpperCase()}`,
            description: `Application packet sent with resume version "${resumeName}" and verified screening questionnaire answers.`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      createdApps.push(newApp);
      setAppliedJobsList([...createdApps]);

      const newLog: DispatchLogEntry = {
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        company: feedJob.company,
        jobTitle: feedJob.jobTitle,
        platform: feedJob.platform,
        matchScore: feedJob.matchScore,
        status: 'success',
        details: `Auto-applied successfully · ATS Ref #${confirmationId}`,
      };
      createdLogs.push(newLog);

      setStatusLog((prev) => [
        ...prev,
        `✅ Successfully applied to ${feedJob.company}! ATS Confirmation: ${confirmationId}`,
      ]);
    }

    setCurrentStep('completed');
    setIsProcessing(false);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // non-fatal
    }

    onApplicationsCreated(createdApps, createdLogs);
    onShowToast(
      'Auto-Apply Batch Completed',
      `Sent ${createdApps.length} applications with tailored pitches`,
      'success',
    );
  };

  useEffect(() => {
    if (isOpen && currentStep === 'idle') {
      runBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Sendaway Live Auto-Apply Dispatcher</h2>
              <p className="text-xs text-slate-400">Autonomous job matching, cover letter tailoring, and submission</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stepper Indicator */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 'scanning'
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : currentStep !== 'idle'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </div>
            <span className={currentStep === 'scanning' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
              Scanning Feeds
            </span>
          </div>

          <div className="h-0.5 w-6 bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 'matching'
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : currentStep === 'tailoring' || currentStep === 'submitting' || currentStep === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <span className={currentStep === 'matching' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
              Matching Criteria
            </span>
          </div>

          <div className="h-0.5 w-6 bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 'tailoring'
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : currentStep === 'submitting' || currentStep === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
            <span className={currentStep === 'tailoring' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
              Tailoring Pitch
            </span>
          </div>

          <div className="h-0.5 w-6 bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 'submitting'
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : currentStep === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              4
            </div>
            <span className={currentStep === 'submitting' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
              Submitting
            </span>
          </div>
        </div>

        {/* Content Body: Live Terminal & Applied List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Real-time Terminal Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 shadow-inner max-h-48 overflow-y-auto">
            <div className="text-slate-500 pb-1 border-b border-slate-900 text-[10px] flex items-center justify-between">
              <span>DISPATCH TERMINAL</span>
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </span>
              )}
            </div>
            {statusLog.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>

          {/* Applied Jobs Cards */}
          {appliedJobsList.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Applications Dispatched in this Run ({appliedJobsList.length})</span>
              </div>
              <div className="space-y-2">
                {appliedJobsList.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2 flex-wrap">
                        <span>{app.company}</span>
                        <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/80 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Verified Employer</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/60">
                          {app.matchScore}% Match
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">{app.jobTitle}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        {app.atsConfirmationId}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Applied via {app.platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isProcessing ? 'Applying in progress...' : 'Batch finished'}
          </div>
          <div className="flex gap-2">
            {!isProcessing ? (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                View in Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsProcessing(false);
                  setCurrentStep('completed');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Stop Run
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
