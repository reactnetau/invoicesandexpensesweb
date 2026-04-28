import { Apple, Monitor, Smartphone } from 'lucide-react';

const platforms = [
  { label: 'iOS', icon: Apple },
  { label: 'Android', icon: Smartphone },
  { label: 'Web', icon: Monitor },
];

export function CrossPlatformNote() {
  return (
    <div className="rounded-[8px] border border-gray-200 bg-white px-4 py-3 shadow-card">
      <p className="text-center text-sm font-bold text-gray-900">One account, 3 platforms</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {platforms.map(({ label, icon: Icon }) => (
          <span key={label} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
