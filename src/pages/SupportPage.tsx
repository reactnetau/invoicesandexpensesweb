import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { SEO } from '../components/SEO';

const SUPPORT_EMAIL = 'polyrhythmm@gmail.com';
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Invoices & Expenses support request')}&body=${encodeURIComponent('Hi, I need help with...')}`;

export function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-50 flex flex-col">
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/schmappslogo.png" alt="Schmapps logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-gray-900">Invoices & Expenses</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <SEO
              title="Support"
              description="Get help with invoices, expenses, subscriptions, account issues, or bug reports. Contact Invoices & Expenses support."
              canonical="/support"
            />
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-brand-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Support</h1>
            <p className="text-sm text-gray-500 mb-6">
              Need help with invoices, expenses, subscriptions, account issues, or want to report a bug? Send us an email and we'll get back to you as soon as possible.
            </p>

            <a href={MAILTO} className="btn-primary flex items-center justify-center gap-2 w-full">
              <Mail className="w-4 h-4" />
              Email support
            </a>

            <p className="mt-5 text-sm text-gray-400">
              If the button does not open your email app, email us directly at{' '}
              <a href={MAILTO} className="text-brand-600 hover:text-brand-700 font-medium break-all">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
