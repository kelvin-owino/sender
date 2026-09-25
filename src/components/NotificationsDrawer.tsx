import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  XCircle,
  Eye,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { NotificationItem, JobApplication } from '../types/job';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  applications: JobApplication[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectApplication: (app: JobApplication) => void;
  onSimulateInterview: () => void;
  onSimulateRejection: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  applications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectApplication,
  onSimulateInterview,
  onSimulateRejection,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'interview_request':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'rejection':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'follow_up_due':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Send className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handleCardClick = (notif: NotificationItem) => {
    onMarkAsRead(notif.id);
    if (notif.applicationId) {
      const matched = applications.find((a) => a.id === notif.applicationId);
      if (matched) {
        onSelectApplication(matched);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications & Alerts</h2>
              <div className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Simulator Toolbar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-400">Simulate Inbound:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateInterview}
              title="Test receiving an interview invitation notification"
              className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-medium transition-colors"
            >
              + Interview Request
            </button>
            <button
              onClick={onSimulateRejection}
              title="Test receiving a rejection or role closed update"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] font-medium transition-colors"
            >
              + Rejection Update
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No notifications yet.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !notif.read
                    ? 'bg-slate-950 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.applicationId && (
                        <span className="text-indigo-400 hover:underline flex items-center gap-0.5">
                          <span>View application</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
