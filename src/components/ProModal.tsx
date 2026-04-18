import { Star, Check, X } from 'lucide-react';

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
];

export function ProModal({ open, reason, loading, onUpgrade, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-modal sm:rounded-modal shadow-md p-6 pb-8 sm:pb-6">
        {/* Handle (mobile sheet feel) */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5 sm:hidden" />

        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-[8px] hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 mb-3">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-700">Pro plan — $7/month</span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h3>

        {reason && (
          <p className="text-sm text-gray-600 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[10px] leading-relaxed">
            {reason}
          </p>
        )}

        <ul className="space-y-2.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <button onClick={onUpgrade} disabled={loading} className="btn-primary w-full mb-2">
          {loading ? 'Redirecting…' : 'Upgrade now — $7/month'}
        </button>
        <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}
