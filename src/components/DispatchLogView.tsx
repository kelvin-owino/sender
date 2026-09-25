import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { DispatchLogEntry } from '../types/job';

interface DispatchLogViewProps {
  logs: DispatchLogEntry[];
  onClearLogs: () => void;
}

export const DispatchLogView: React.FC<DispatchLogViewProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Live Dispatch Event Feed</h2>
          <p className="text-xs text-slate-400">
            Real-time activity logs from LinkedIn, Greenhouse, and Email outreach workers
          </p>
        </div>
        <button
          onClick={onClearLogs}
          className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          Clear Feed
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>DISPATCH LOG STREAM ({logs.length} EVENTS)</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Worker Daemon Active
          </span>
        </div>

        <div className="divide-y divide-slate-900 max-h-[600px] overflow-y-auto p-2">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-600 font-sans text-xs">
              No dispatch logs recorded yet. Run Auto-Apply to generate events.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-slate-900/40 transition-colors flex items-start gap-3">
                <div className="mt-0.5">
                  {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {log.status === 'filtered_out' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {log.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                  {log.status === 'in_progress' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.company}</span>
                      <span className="text-[11px] text-slate-400">· {log.jobTitle}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                        {log.platform}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed font-sans">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
