import { useState, useEffect, useCallback } from 'react';
import { FileText, Receipt, Users, Activity } from 'lucide-react';
import { client, type ActivityEvent } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SEO } from '../components/SEO';

type Range = '1m' | '3m' | '6m' | '1y';

const RANGES: { value: Range; label: string; months: number }[] = [
  { value: '1m', label: '1 month',  months: 1  },
  { value: '3m', label: '3 months', months: 3  },
  { value: '6m', label: '6 months', months: 6  },
  { value: '1y', label: '1 year',   months: 12 },
];

const EVENT_ICONS: Record<string, typeof Activity> = {
  invoice_created: FileText,
  expense_created: Receipt,
  client_created:  Users,
};

const EVENT_COLORS: Record<string, string> = {
  invoice_created: 'bg-blue-50 text-blue-600',
  expense_created: 'bg-orange-50 text-orange-600',
  client_created:  'bg-green-50 text-green-600',
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function SnapshotPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('3m');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client.models.ActivityEvent.list();
      const sorted = [...(result.data ?? [])].sort(
        (a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1
      );
      setEvents(sorted);
    } catch {
      // silently ignore — non-critical feature
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const cutoff = (() => {
    const d = new Date();
    const months = RANGES.find((r) => r.value === range)?.months ?? 3;
    d.setMonth(d.getMonth() - months);
    return d;
  })();

  const visible = events.filter((e) => new Date(e.createdAt ?? '') >= cutoff);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <SEO title="Snapshot" noIndex />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Snapshot</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No activity yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Events will appear here as you create invoices, expenses, and clients.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((event) => {
            const Icon = EVENT_ICONS[event.type] ?? Activity;
            const iconColor = EVENT_COLORS[event.type] ?? 'bg-gray-100 text-gray-500';
            return (
              <div key={event.id} className="card p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{event.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
