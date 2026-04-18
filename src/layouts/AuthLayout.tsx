import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/schmappslogo.png" alt="Schmapps logo" className="w-8 h-8 rounded-[10px] object-cover" />
          <span className="font-bold text-gray-900 text-sm">Invoices & Expenses</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
