import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, EmptyState, LoadingState, PageHeader } from '../components/ui';
import { secondaryButtonClass } from '../components/formStyles';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import type { NotificationItem } from '../types';

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.notifications);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load notifications');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function openNotification(notification: NotificationItem) {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, isRead: true } : item
        )));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to update the notification');
        return;
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  }

  async function handleMarkAll() {
    setError('');
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to mark notifications as read');
    } finally {
      setMarkingAll(false);
    }
  }

  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Assignments, submissions, revisions, approvals, and deadline reminders."
        action={
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll || unread === 0}
            className={secondaryButtonClass}
          >
            {markingAll ? 'Saving...' : 'Mark all as read'}
          </button>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading notifications...</LoadingState>
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications yet">They appear here when a job is assigned or your work is reviewed.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 ${notification.isRead ? '' : 'bg-slate-50'}`}
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-slate-900'}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">{notification.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{notification.message}</span>
                    <span className="mt-1 block text-xs text-slate-500">{formatTimestamp(notification.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
