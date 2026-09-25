import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Mail,
  Linkedin,
  Globe,
  Briefcase,
  Layers,
  Lock,
} from 'lucide-react';
import { ConnectedAccount, JobPlatform } from '../types/job';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: ConnectedAccount[];
  onUpdateAccounts: (accounts: ConnectedAccount[]) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onUpdateAccounts,
  onShowToast,
}) => {
  const [accountList, setAccountList] = useState<ConnectedAccount[]>(accounts);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccountList(accounts);
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const toggleConnect = (id: string) => {
    setAccountList((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const nextState = !acc.connected;
          return {
            ...acc,
            connected: nextState,
            statusText: nextState ? 'Active & Ready' : 'Disconnected',
            requiresAttention: false,
            lastSyncAt: nextState ? new Date().toISOString() : acc.lastSyncAt,
          };
        }
        return acc;
      }),
    );
  };

  const updateQuota = (id: string, quota: number) => {
    setAccountList((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, dailyQuota: Math.max(5, Math.min(100, quota)) } : acc)),
    );
  };

  const handleSave = () => {
    onUpdateAccounts(accountList);
    onShowToast('Connected Accounts Updated', 'Application dispatches configured', 'success');
    onClose();
  };

  const getPlatformIcon = (type: JobPlatform) => {
    switch (type) {
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-[#0A66C2]" />;
      case 'direct_email':
        return <Mail className="w-5 h-5 text-rose-400" />;
      case 'greenhouse':
      case 'lever':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'indeed':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      default:
        return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Connected Application Accounts</h2>
              <p className="text-xs text-slate-400">
                Sendaway dispatches applications through your authenticated accounts and email
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Safe Rate Limiting:</strong> Daily application quotas prevent account flagging on LinkedIn and
              Indeed. Sendaway spaces submissions with realistic human jitter delays.
            </span>
          </div>

          <div className="space-y-3">
            {accountList.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:border-slate-700/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getPlatformIcon(acc.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{acc.name}</span>
                        {acc.connected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Not connected</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {acc.usernameOrEmail || 'Needs account linking'}
                        {acc.lastSyncAt && ` · Synced ${new Date(acc.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleConnect(acc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        acc.connected
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {acc.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {/* Quota slider & status if connected */}
                {acc.connected && (
                  <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">Daily Limit:</span>
                      <span className="font-mono text-slate-200 font-medium">{acc.dailyQuota} apps/day</span>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={acc.dailyQuota}
                        onChange={(e) => updateQuota(acc.id, Number(e.target.value))}
                        className="w-24 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dispatched today: <span className="text-indigo-400 font-semibold">{acc.dailyUsed}</span> /{' '}
                      {acc.dailyQuota}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {accountList.filter((a) => a.connected).length} active integrations
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Save Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
