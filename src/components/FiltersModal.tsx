import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Check,
  Building,
  Ban,
  Mail,
  DollarSign,
  Clock,
  Plus,
  Percent,
} from 'lucide-react';
import { JobFilterConfig } from '../types/job';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfig: JobFilterConfig;
  onSaveFilters: (config: JobFilterConfig) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filterConfig,
  onSaveFilters,
  onShowToast,
}) => {
  const [filters, setFilters] = useState<JobFilterConfig>(filterConfig);
  const [newWhiteCompany, setNewWhiteCompany] = useState('');
  const [newBlackCompany, setNewBlackCompany] = useState('');
  const [newBlackKeyword, setNewBlackKeyword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFilters(filterConfig);
    }
  }, [isOpen, filterConfig]);

  if (!isOpen) return null;

  const addWhitelistedCompany = () => {
    if (!newWhiteCompany.trim()) return;
    if (!filters.whitelistedCompanies.includes(newWhiteCompany.trim())) {
      setFilters({
        ...filters,
        whitelistedCompanies: [...filters.whitelistedCompanies, newWhiteCompany.trim()],
      });
    }
    setNewWhiteCompany('');
  };

  const removeWhitelistedCompany = (name: string) => {
    setFilters({
      ...filters,
      whitelistedCompanies: filters.whitelistedCompanies.filter((c) => c !== name),
    });
  };

  const addBlacklistedCompany = () => {
    if (!newBlackCompany.trim()) return;
    if (!filters.blacklistedCompanies.includes(newBlackCompany.trim())) {
      setFilters({
        ...filters,
        blacklistedCompanies: [...filters.blacklistedCompanies, newBlackCompany.trim()],
      });
    }
    setNewBlackCompany('');
  };

  const removeBlacklistedCompany = (name: string) => {
    setFilters({
      ...filters,
      blacklistedCompanies: filters.blacklistedCompanies.filter((c) => c !== name),
    });
  };

  const addBlacklistedKeyword = () => {
    if (!newBlackKeyword.trim()) return;
    if (!filters.blacklistedKeywords.includes(newBlackKeyword.trim())) {
      setFilters({
        ...filters,
        blacklistedKeywords: [...filters.blacklistedKeywords, newBlackKeyword.trim()],
      });
    }
    setNewBlackKeyword('');
  };

  const removeBlacklistedKeyword = (kw: string) => {
    setFilters({
      ...filters,
      blacklistedKeywords: filters.blacklistedKeywords.filter((k) => k !== kw),
    });
  };

  const handleSave = () => {
    onSaveFilters(filters);
    onShowToast('Filter Criteria Applied', 'Job matcher and auto-apply rules updated', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Job Matching & Company Filters</h2>
              <p className="text-xs text-slate-400">
                Filter which companies to target, blacklist unwanted recruiters, and set match thresholds
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Match Score Slider */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Minimum Resume Compatibility Score</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                {filters.minMatchScore}% Match
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sendaway evaluates job descriptions against your skills. Applications below this match threshold are skipped.
            </p>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={filters.minMatchScore}
              onChange={(e) => setFilters({ ...filters, minMatchScore: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Real Employer & Domain Filtering */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Verified Real Corporate Employers Only</span>
              </div>
              <input
                type="checkbox"
                checked={filters.onlyDirectCompanyEmails}
                onChange={(e) => setFilters({ ...filters, onlyDirectCompanyEmails: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Guarantees Sendaway dispatches exclusively to verified corporate domains (e.g. @stripe.com, @anthropic.com) with official ATS job boards (Greenhouse, Lever, Workday, LinkedIn). Strictly rejects spam recruiters, unverified webmail (@gmail, @yahoo), and third-party staffing middlemen.
            </p>
          </div>

          {/* Minimum Salary Floor */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Minimum Salary Expectation</span>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                ${(filters.minSalary / 1000).toFixed(0)}k+ / yr
              </span>
            </div>
            <input
              type="range"
              min="60000"
              max="250000"
              step="5000"
              value={filters.minSalary}
              onChange={(e) => setFilters({ ...filters, minSalary: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Dream Companies / Whitelist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Priority Dream Companies (Auto-apply priority)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {filters.whitelistedCompanies.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-950/40 text-indigo-300 text-xs rounded-lg border border-indigo-800/50"
                >
                  <span>{c}</span>
                  <button onClick={() => removeWhitelistedCompany(c)} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add dream company (e.g. OpenAI, Stripe, Linear)"
                value={newWhiteCompany}
                onChange={(e) => setNewWhiteCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWhitelistedCompany())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addWhitelistedCompany}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Company Blacklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span>Blacklisted Companies (Never apply or send resume)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {filters.blacklistedCompanies.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/30 text-rose-300 text-xs rounded-lg border border-rose-800/40"
                >
                  <span>{c}</span>
                  <button onClick={() => removeBlacklistedCompany(c)} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add company to blacklist (e.g. Current Employer, Spam Agency)"
                value={newBlackCompany}
                onChange={(e) => setNewBlackCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBlacklistedCompany())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={addBlacklistedCompany}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Automated Follow-up Rule */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Automated Recruiter Follow-up</span>
              </div>
              <input
                type="checkbox"
                checked={filters.autoSendFollowUp}
                onChange={(e) => setFilters({ ...filters, autoSendFollowUp: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Automatically draft and notify when an application reaches {filters.followUpDaysAfter} business days without recruiter feedback.
            </p>
            {filters.autoSendFollowUp && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-300">Follow-up interval:</span>
                <select
                  value={filters.followUpDaysAfter}
                  onChange={(e) => setFilters({ ...filters, followUpDaysAfter: Number(e.target.value) })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value={3}>3 days after applying</option>
                  <option value={5}>5 days after applying (Recommended)</option>
                  <option value={7}>7 days after applying</option>
                  <option value={10}>10 days after applying</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {filters.whitelistedCompanies.length} priority · {filters.blacklistedCompanies.length} blacklisted
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
