import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Check,
  FileText,
  User,
  Briefcase,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  Star,
  Eye,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Copy,
} from 'lucide-react';
import { CandidateProfile, ScreeningAnswers, ResumeVersion } from '../types/job';
import { SAMPLE_RESUMES } from '../data/mockData';
import { parseResumeApi } from '../services/api';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onSaveProfile: (profile: CandidateProfile) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'upload' | 'profile' | 'screening'>('versions');
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    if (profile.resumeVersions && profile.resumeVersions.length > 0) {
      return profile.resumeVersions;
    }
    // If user has a resume file/text but no versions array yet, create initial default version
    if (profile.rawResumeText || profile.resumeFileName) {
      return [
        {
          id: 'rv-default',
          name: profile.targetTitles[0] ? `${profile.targetTitles[0]} Version` : 'Primary Resume',
          targetRole: profile.targetTitles[0] || 'Software Engineer',
          fileName: profile.resumeFileName || 'Resume.pdf',
          uploadedAt: profile.resumeUploadedAt || new Date().toISOString(),
          rawText: profile.rawResumeText || '',
          skills: profile.primarySkills || [],
          summary: profile.summary || '',
          isDefault: true,
        },
      ];
    }
    return [];
  });

  const [activeVersionId, setActiveVersionId] = useState<string>(
    profile.activeResumeId || versions.find((v) => v.isDefault)?.id || versions[0]?.id || '',
  );

  // New Version Form State (for upload tab)
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionTargetRole, setNewVersionTargetRole] = useState('');
  const [newVersionMakeDefault, setNewVersionMakeDefault] = useState(true);
  const [newVersionRawText, setNewVersionRawText] = useState('');
  const [newVersionFileName, setNewVersionFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Preview state for inspect
  const [inspectingVersion, setInspectingVersion] = useState<ResumeVersion | null>(null);

  // Profile editing inputs
  const [newSkill, setNewSkill] = useState('');
  const [newTargetTitle, setNewTargetTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      const currentVersions =
        profile.resumeVersions && profile.resumeVersions.length > 0
          ? profile.resumeVersions
          : profile.rawResumeText
          ? [
              {
                id: 'rv-default',
                name: profile.targetTitles[0] ? `${profile.targetTitles[0]} Version` : 'Primary Resume',
                targetRole: profile.targetTitles[0] || 'Software Engineer',
                fileName: profile.resumeFileName || 'Resume.pdf',
                uploadedAt: profile.resumeUploadedAt || new Date().toISOString(),
                rawText: profile.rawResumeText || '',
                skills: profile.primarySkills || [],
                summary: profile.summary || '',
                isDefault: true,
              },
            ]
          : [];

      setVersions(currentVersions);
      const defaultId =
        profile.activeResumeId || currentVersions.find((v) => v.isDefault)?.id || currentVersions[0]?.id || '';
      setActiveVersionId(defaultId);

      // If user has zero versions, default to upload tab so they can immediately add one
      setActiveTab(currentVersions.length > 0 ? 'versions' : 'upload');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Add a new resume version from text & file
  const handleProcessAndAddVersion = async (
    textToParse: string,
    fileName: string,
    customName?: string,
    targetRole?: string,
    makeDefault = true,
  ) => {
    if (!textToParse.trim()) {
      onShowToast('Empty Content', 'Please provide or paste resume text to analyze', 'error');
      return;
    }

    setIsParsing(true);
    try {
      const result = await parseResumeApi(textToParse);
      const parsed = result.profile;

      const derivedRole =
        targetRole?.trim() ||
        parsed?.targetTitles?.[0] ||
        formData.targetTitles[0] ||
        'Software Engineer';

      const derivedName =
        customName?.trim() ||
        (derivedRole ? `${derivedRole} Resume` : `Resume Version ${versions.length + 1}`);

      const newVersionId = `rv-${Date.now()}`;
      const newVersion: ResumeVersion = {
        id: newVersionId,
        name: derivedName,
        targetRole: derivedRole,
        fileName: fileName || 'Uploaded_Resume.pdf',
        uploadedAt: new Date().toISOString(),
        rawText: textToParse,
        skills: parsed?.primarySkills?.length ? parsed.primarySkills : formData.primarySkills,
        summary: parsed?.summary || formData.summary,
        isDefault: makeDefault || versions.length === 0,
      };

      let updatedVersions = versions;
      if (newVersion.isDefault) {
        updatedVersions = updatedVersions.map((v) => ({ ...v, isDefault: false }));
      }
      updatedVersions = [...updatedVersions, newVersion];
      setVersions(updatedVersions);

      if (newVersion.isDefault || !activeVersionId) {
        setActiveVersionId(newVersionId);
      }

      // Also update candidate personal information if empty
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName.trim() ? prev.fullName : parsed?.fullName || 'Applicant',
        email: prev.email.trim() ? prev.email : parsed?.email || '',
        phone: prev.phone.trim() ? prev.phone : parsed?.phone || '',
        location: prev.location.trim() ? prev.location : parsed?.location || 'Remote',
        summary: prev.summary.trim() ? prev.summary : parsed?.summary || '',
        primarySkills: Array.from(new Set([...prev.primarySkills, ...(parsed?.primarySkills || [])])),
        targetTitles: Array.from(new Set([...prev.targetTitles, derivedRole])),
        rawResumeText: textToParse,
        resumeFileName: fileName || 'Uploaded_Resume.pdf',
        resumeUploadedAt: new Date().toISOString(),
      }));

      // Reset form fields
      setNewVersionName('');
      setNewVersionTargetRole('');
      setNewVersionRawText('');
      setNewVersionFileName('');

      onShowToast(
        'Resume Version Added',
        `Saved "${derivedName}" with ${newVersion.skills.length} extracted skills`,
        'success',
      );
      setActiveTab('versions');
    } catch {
      onShowToast('Parsing Error', 'Could not parse resume format, please check fields manually', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setNewVersionFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = (e.target?.result as string) || '';
      setNewVersionRawText(content);
      await handleProcessAndAddVersion(
        content,
        file.name,
        newVersionName,
        newVersionTargetRole,
        newVersionMakeDefault,
      );
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Quick load template version
  const handleLoadSampleVersion = (key: 'fullstack' | 'product' | 'frontend') => {
    const sample = SAMPLE_RESUMES[key];
    const newVersionId = `rv-${Date.now()}`;
    const newVersion: ResumeVersion = {
      id: newVersionId,
      name: sample.label,
      targetRole: sample.parsed.targetTitles[0],
      fileName: sample.fileName,
      uploadedAt: new Date().toISOString(),
      rawText: sample.text,
      skills: sample.parsed.primarySkills,
      summary: sample.parsed.summary,
      isDefault: versions.length === 0,
    };

    let updated = versions;
    if (newVersion.isDefault) {
      updated = updated.map((v) => ({ ...v, isDefault: false }));
    }
    updated = [...updated, newVersion];
    setVersions(updated);

    if (newVersion.isDefault || !activeVersionId) {
      setActiveVersionId(newVersionId);
    }

    // Auto-fill candidate info if blank
    if (!formData.fullName.trim()) {
      setFormData((prev) => ({
        ...prev,
        ...sample.parsed,
        rawResumeText: sample.text,
        resumeFileName: sample.fileName,
        resumeUploadedAt: new Date().toISOString(),
      }));
    }

    onShowToast(`Version Added: ${sample.label}`, 'Ready to be selected for job applications', 'success');
  };

  const setVersionAsDefault = (id: string) => {
    const updated = versions.map((v) => ({
      ...v,
      isDefault: v.id === id,
    }));
    setVersions(updated);
    setActiveVersionId(id);

    const targetVersion = updated.find((v) => v.id === id);
    if (targetVersion) {
      setFormData((prev) => ({
        ...prev,
        rawResumeText: targetVersion.rawText,
        resumeFileName: targetVersion.fileName,
        resumeUploadedAt: targetVersion.uploadedAt,
      }));
      onShowToast('Default Version Set', `"${targetVersion.name}" is now the primary resume for auto-apply`, 'info');
    }
  };

  const deleteVersion = (id: string) => {
    if (versions.length <= 1) {
      onShowToast('Cannot Delete', 'You must have at least one resume version on file', 'error');
      return;
    }
    const filtered = versions.filter((v) => v.id !== id);
    // If we deleted the default, set first remaining as default
    if (!filtered.some((v) => v.isDefault)) {
      filtered[0].isDefault = true;
    }
    setVersions(filtered);
    if (activeVersionId === id) {
      setActiveVersionId(filtered[0].id);
    }
    onShowToast('Version Deleted', 'Resume version removed from pipeline', 'info');
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!formData.primarySkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        primarySkills: [...formData.primarySkills, newSkill.trim()],
      });
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      primarySkills: formData.primarySkills.filter((s) => s !== skill),
    });
  };

  const addTargetTitle = () => {
    if (!newTargetTitle.trim()) return;
    if (!formData.targetTitles.includes(newTargetTitle.trim())) {
      setFormData({
        ...formData,
        targetTitles: [...formData.targetTitles, newTargetTitle.trim()],
      });
    }
    setNewTargetTitle('');
  };

  const removeTargetTitle = (title: string) => {
    setFormData({
      ...formData,
      targetTitles: formData.targetTitles.filter((t) => t !== title),
    });
  };

  const updateScreening = <K extends keyof ScreeningAnswers>(field: K, val: ScreeningAnswers[K]) => {
    setFormData({
      ...formData,
      screeningAnswers: {
        ...formData.screeningAnswers,
        [field]: val,
      },
    });
  };

  const handleSave = () => {
    const defaultVersion = versions.find((v) => v.isDefault) || versions[0];
    const finalProfile: CandidateProfile = {
      ...formData,
      resumeVersions: versions,
      activeResumeId: defaultVersion?.id || '',
      resumeFileName: defaultVersion?.fileName || formData.resumeFileName || 'Resume.pdf',
      rawResumeText: defaultVersion?.rawText || formData.rawResumeText || '',
      resumeUploadedAt: defaultVersion?.uploadedAt || formData.resumeUploadedAt || new Date().toISOString(),
    };

    onSaveProfile(finalProfile);
    onShowToast('Resume Profile Saved', `${versions.length} version(s) saved and active for dispatches`, 'success');
    onClose();
  };

  const defaultVersion = versions.find((v) => v.isDefault) || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Resume & Versions Manager</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  {versions.length} {versions.length === 1 ? 'Version' : 'Versions'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload tailored resumes (e.g. Full-Stack, Frontend, Manager) and assign them to specific job applications
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'versions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Resume Versions ({versions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload / Add Version</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Candidate Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('screening')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'screening'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Screening Auto-Fill</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: VERSIONS HUB */}
          {activeTab === 'versions' && (
            <div className="space-y-5">
              {/* Top Banner with Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Active Versions for Application Targeting</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Default version used for auto-apply: <span className="text-indigo-300 font-semibold">{defaultVersion?.name || 'None'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload New Version</span>
                </button>
              </div>

              {/* Quick Load Sample Versions if testing */}
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                <div className="text-[11px] text-slate-400 font-medium">Quickly load pre-made role-specific versions for testing:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLoadSampleVersion('fullstack')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-indigo-300 transition-colors"
                  >
                    <Briefcase className="w-3 h-3 text-indigo-400" />
                    <span>+ Full-Stack Specialist</span>
                  </button>
                  <button
                    onClick={() => handleLoadSampleVersion('frontend')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-emerald-300 transition-colors"
                  >
                    <Star className="w-3 h-3 text-emerald-400" />
                    <span>+ Lead Frontend & UI/UX</span>
                  </button>
                  <button
                    onClick={() => handleLoadSampleVersion('product')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-cyan-300 transition-colors"
                  >
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>+ Senior Product Manager</span>
                  </button>
                </div>
              </div>

              {/* Versions List */}
              {versions.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">No Resume Versions Uploaded</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Add your first resume version or click any of the quick-load templates above to test application targeting.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resume Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((ver) => (
                    <div
                      key={ver.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ver.isDefault
                          ? 'bg-indigo-950/20 border-indigo-500/60 ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{ver.name}</h4>
                            {ver.isDefault && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Default for Auto-Apply
                              </span>
                            )}
                            {ver.targetRole && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                                Role: {ver.targetRole}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{ver.fileName}</span>
                            <span>·</span>
                            <span>Uploaded {new Date(ver.uploadedAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>{ver.rawText.length.toLocaleString()} chars</span>
                          </div>

                          {/* Skills badges */}
                          {ver.skills && ver.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {ver.skills.slice(0, 6).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {ver.skills.length > 6 && (
                                <span className="text-[10px] text-slate-500 self-center">
                                  +{ver.skills.length - 6} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <button
                            onClick={() => setInspectingVersion(ver)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800 transition-colors flex items-center gap-1"
                            title="Preview resume text and parsed summary"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Preview</span>
                          </button>

                          {!ver.isDefault ? (
                            <button
                              onClick={() => setVersionAsDefault(ver.id)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              Make Default
                            </button>
                          ) : (
                            <span className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400">
                              Active Default
                            </span>
                          )}

                          <button
                            onClick={() => deleteVersion(ver.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                            title="Delete this version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: UPLOAD / ADD NEW VERSION */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Upload or paste a tailored resume for specific positions (e.g., frontend, staff engineer, machine learning).
                  You can assign this specific version to any job application.
                </span>
              </div>

              {/* Version Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Resume Version Label / Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer Version"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Full-Stack Engineer"
                    value={newVersionTargetRole}
                    onChange={(e) => setNewVersionTargetRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Make default toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVersionMakeDefault}
                  onChange={(e) => setNewVersionMakeDefault(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <span>Set as default version for new autonomous job dispatches</span>
              </label>

              {/* Drag & Drop File Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-2.5">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Upload PDF, Word (DOCX), or Text file
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                  Sendaway analyzes your resume keywords, experience, and projects to match target requisitions.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition-colors">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Raw Text Paste */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Or paste raw resume text:</label>
                  <button
                    onClick={() =>
                      handleProcessAndAddVersion(
                        newVersionRawText,
                        newVersionFileName || 'Pasted_Resume.txt',
                        newVersionName,
                        newVersionTargetRole,
                        newVersionMakeDefault,
                      )
                    }
                    disabled={isParsing || !newVersionRawText.trim()}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 font-medium"
                  >
                    {isParsing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing and Adding...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Save Version from Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={newVersionRawText}
                  onChange={(e) => setNewVersionRawText(e.target.value)}
                  placeholder="Paste plain resume text here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB: CANDIDATE PROFILE & DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.linkedInUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/yourname"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Target Job Titles */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Roles
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.targetTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-indigo-300 text-xs rounded-lg border border-slate-700/80"
                    >
                      <span>{title}</span>
                      <button
                        onClick={() => removeTargetTitle(title)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add target role (e.g. Lead Software Engineer)"
                    value={newTargetTitle}
                    onChange={(e) => setNewTargetTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetTitle())}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={addTargetTitle}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Primary Technical Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Core Skills & Keywords
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  {formData.primarySkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/90 text-slate-200 text-xs rounded border border-slate-700"
                    >
                      <span>{skill}</span>
                      <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. TypeScript, React 19, Docker, AWS)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={addSkill}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Professional Elevator Pitch / Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB: SCREENING QUESTIONNAIRE */}
          {activeTab === 'screening' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Job portals (LinkedIn, Greenhouse, Lever, Workday) require these exact screening questions.
                  Sendaway automatically answers them accurately on your behalf.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Authorization */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-white">Work Authorization</div>
                  <div className="text-[11px] text-slate-400">
                    Are you legally authorized to work in the country of application?
                  </div>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.screeningAnswers.authorizedInUS === true}
                        onChange={() => updateScreening('authorizedInUS', true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Yes (Authorized)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.screeningAnswers.authorizedInUS === false}
                        onChange={() => updateScreening('authorizedInUS', false)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Sponsorship */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-white">Visa Sponsorship</div>
                  <div className="text-[11px] text-slate-400">
                    Will you now or in the future require visa sponsorship?
                  </div>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.screeningAnswers.requiresSponsorship === false}
                        onChange={() => updateScreening('requiresSponsorship', false)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>No (Not needed)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.screeningAnswers.requiresSponsorship === true}
                        onChange={() => updateScreening('requiresSponsorship', true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                </div>

                {/* Notice Period */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-white">Notice Period</div>
                  <div className="text-[11px] text-slate-400">How quickly can you start?</div>
                  <select
                    value={formData.screeningAnswers.noticePeriod}
                    onChange={(e) => updateScreening('noticePeriod', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Immediate">Immediate / Available Now</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks standard</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>

                {/* Remote Preference */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-white">Location Preference</div>
                  <div className="text-[11px] text-slate-400">Workplace arrangement</div>
                  <select
                    value={formData.screeningAnswers.remotePreference}
                    onChange={(e) => updateScreening('remotePreference', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="remote_only">Remote Only</option>
                    <option value="hybrid">Hybrid (Remote + Office)</option>
                    <option value="any">Any (Remote, Hybrid, Onsite)</option>
                  </select>
                </div>

                {/* Desired Salary */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 sm:col-span-2">
                  <div className="text-xs font-semibold text-white">Desired Annual Compensation ($ USD)</div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Minimum Base ($)</label>
                      <input
                        type="number"
                        step={5000}
                        value={formData.screeningAnswers.desiredSalaryMin}
                        onChange={(e) => updateScreening('desiredSalaryMin', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Target Base ($)</label>
                      <input
                        type="number"
                        step={5000}
                        value={formData.screeningAnswers.desiredSalaryMax}
                        onChange={(e) => updateScreening('desiredSalaryMax', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {versions.length} versions stored · Default: <span className="text-indigo-300 font-semibold">{defaultVersion?.name || 'None'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspect / Preview Version Modal */}
      {inspectingVersion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{inspectingVersion.name}</h3>
                  {inspectingVersion.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Default Version
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {inspectingVersion.fileName} · Target Role: {inspectingVersion.targetRole || 'General'}
                </p>
              </div>
              <button
                onClick={() => setInspectingVersion(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {inspectingVersion.skills && inspectingVersion.skills.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5">Extracted Core Competencies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingVersion.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-slate-950 text-indigo-300 rounded text-xs border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5">Full Text Content</div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                  {inspectingVersion.rawText || 'No text content captured.'}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Uploaded {new Date(inspectingVersion.uploadedAt).toLocaleString()}
              </span>
              <button
                onClick={() => setInspectingVersion(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
