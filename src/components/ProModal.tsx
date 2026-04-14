import { Zap, X, Check } from 'lucide-react';

interface Props {
  open: boolean;
  reason?: string;
  loading?: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

const features = [
  'Unlimited invoices per month',
  'CSV export for any financial year',
  'AI financial summaries',
  'Priority support',
];

export function ProModal({ open, reason, loading, onUpgrade, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
            <Zap className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Upgrade to Pro</h3>
            <p className="text-sm text-gray-500">$7 / month</p>
          </div>
        </div>

        {reason && (
          <p className="text-sm text-gray-600 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            {reason}
          </p>
        )}

        <ul className="space-y-2 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <button onClick={onUpgrade} disabled={loading} className="btn-primary w-full">
          {loading ? 'Redirecting…' : 'Upgrade to Pro — $7/month'}
        </button>
      </div>
    </div>
  );
}
