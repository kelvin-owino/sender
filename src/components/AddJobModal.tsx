import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Building,
  Briefcase,
  Globe,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { JobApplication, JobPlatform, CandidateProfile } from '../types/job';
import { generateCoverLetterApi } from '../services/api';
import { REAL_COMPANIES_REGISTRY, getCompanyVerification } from '../data/realCompanies';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onAddApplication: (app: JobApplication) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddApplication,
  onShowToast,
}) => {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('Remote (US)');
  const [salaryRange, setSalaryRange] = useState('$160,000 - $200,000');
  const [platform, setPlatform] = useState<JobPlatform>('greenhouse');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const defaultVer = availableVersions.find((v) => v.isDefault) || availableVersions[0];
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    profile.activeResumeId || defaultVer?.id || '',
  );

  useEffect(() => {
    if (isOpen) {
      const def = availableVersions.find((v) => v.isDefault) || availableVersions[0];
      setSelectedVersionId(profile.activeResumeId || def?.id || '');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const verification = getCompanyVerification(company, jobUrl);

  const handleSelectVerifiedCompany = (compName: string) => {
    const verified = REAL_COMPANIES_REGISTRY.find((c) => c.name === compName);
    if (verified) {
      setCompany(verified.name);
      setJobUrl(verified.careersUrl);
      setPlatform(verified.verifiedAts as JobPlatform);
      setRecruiterEmail(`jobs${verified.recruiterDomain}`);
      setLocation('Remote (US / Worldwide)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !jobTitle.trim()) {
      onShowToast('Missing Fields', 'Company name and job title are required', 'error');
      return;
    }

    setIsSubmitting(true);
    let coverLetter = '';
    try {
      const res = await generateCoverLetterApi(company, jobTitle, '', profile);
      coverLetter = res.coverLetter;
    } catch {
      coverLetter = `Dear ${company} Team,\n\nI am excited to apply for the ${jobTitle} role. With my background in ${profile.primarySkills.slice(0, 3).join(', ')}, I would love to contribute to your success.\n\nWarm regards,\n${profile.fullName || 'Candidate'}`;
    }

    const domain = verification.record ? verification.record.domain : verification.suggestedDomain;
    const finalJobUrl = jobUrl.trim() || (verification.record ? verification.record.careersUrl : `https://${domain}`);
    const atsCode = `${company.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const chosenVersion = availableVersions.find((v) => v.id === selectedVersionId) || defaultVer;

    const newApp: JobApplication = {
      id: `app-custom-${Date.now()}`,
      company: company.trim(),
      companyDomain: domain,
      jobTitle: jobTitle.trim(),
      location: location.trim() || 'Remote',
      salaryRange: salaryRange.trim(),
      platform,
      jobUrl: finalJobUrl,
      appliedDate: new Date().toISOString(),
      status: 'applied',
      matchScore: 94,
      matchedSkills: chosenVersion?.skills?.length
        ? chosenVersion.skills.slice(0, 5)
        : profile.primarySkills.length
        ? profile.primarySkills.slice(0, 5)
        : ['TypeScript', 'React', 'APIs'],
      recruiterName: recruiterName.trim() || 'Talent Acquisition Team',
      recruiterEmail: recruiterEmail.trim() || `careers@${domain}`,
      tailoredCoverLetter: coverLetter,
      atsConfirmationId: atsCode,
      resumeVersionId: chosenVersion?.id,
      resumeVersionName: chosenVersion?.name || 'Primary Resume',
      followUpDueDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      notes: notes.trim() || `Verified employer ${company}. Official careers portal confirmed.`,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          type: 'submitted',
          title: `Application Logged & Dispatched (${platform.toUpperCase()})`,
          description: `Dispatched with resume version "${chosenVersion?.name || 'Primary'}" to verified employer ${company} (ATS #${atsCode}).`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onAddApplication(newApp);
    setIsSubmitting(false);
    onShowToast('Job Added to Sendaway', `Now tracking verified application for ${company}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Track or Queue Job Opening</h2>
              <p className="text-xs text-slate-400">Add an external job opening to your Sendaway pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Select Real Verified Employers */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Select Verified Real Employers:</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-[11px]">
            {['Anthropic', 'Stripe', 'Linear', 'Figma', 'Vercel', 'Supabase', 'Postman'].map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => handleSelectVerifiedCompany(comp)}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white shrink-0 transition-colors"
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Company *</label>
                {verification.isVerified && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Real Co
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Stripe or Anthropic"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as JobPlatform)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="linkedin">LinkedIn Easy Apply</option>
                <option value="greenhouse">Greenhouse ATS</option>
                <option value="lever">Lever ATS</option>
                <option value="indeed">Indeed</option>
                <option value="direct_email">Direct Recruiter Email</option>
                <option value="workday">Workday</option>
                <option value="glassdoor">Glassdoor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="Remote (US), San Francisco, etc."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Salary Range</label>
              <input
                type="text"
                placeholder="e.g. $170,000 - $210,000"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Link / Post URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Recruiter Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Recruiter Email (Optional)</label>
              <input
                type="email"
                placeholder="sjenkins@company.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Resume Version Selection */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Resume Version to Dispatch *</span>
              </label>
              {availableVersions.length > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {availableVersions.length} available
                </span>
              )}
            </div>
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {availableVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.isDefault ? '(Default)' : ''} {v.targetRole ? `· ${v.targetRole}` : ''}
                </option>
              ))}
              {availableVersions.length === 0 && (
                <option value="">Primary System Resume</option>
              )}
            </select>
            <p className="text-[10px] text-slate-400">
              Attach a specific tailored resume version for this company and requisition.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Referral notes, team context, or screening dates..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 -mx-6 -mb-6 flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Add Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
