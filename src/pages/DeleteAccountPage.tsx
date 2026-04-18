import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

export function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent('Account Deletion Request – Invoices & Expenses');
    const body = encodeURIComponent(
      `I would like to request the deletion of my Invoices & Expenses account.\n\nAccount email: ${email}\n\nReason: ${reason || 'No reason provided.'}\n\nI understand that this will permanently delete all my data including invoices, expenses, and client records.`
    );

    window.location.href = `mailto:support@invoicesandexpenses.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-50 flex flex-col">
      <SEO title="Delete Account" noIndex />
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/schmappslogo.png" alt="Schmapps logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-gray-900">Invoices & Expenses</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="card p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Request sent</h1>
              <p className="text-sm text-gray-500 mb-6">
                Your email client should have opened with a pre-filled deletion request. Please send that email to complete your request.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If your email client didn't open, please email us directly at{' '}
                <a href="mailto:support@invoicesandexpenses.com" className="text-brand-600 hover:text-brand-700 font-medium">
                  support@invoicesandexpenses.com
                </a>{' '}
                with your account email and deletion request.
              </p>
              <p className="text-xs text-gray-400">We process deletion requests within 30 days.</p>
              <Link to="/" className="mt-6 block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
                Back to home
              </Link>
            </div>
          ) : (
            <div className="card p-8">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Delete account</h1>
              <p className="text-sm text-gray-500 mb-6">
                Submit a request to permanently delete your Invoices & Expenses account and all associated data.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">This action is permanent</p>
                  <p>All your invoices, expenses, clients, and account data will be deleted and cannot be recovered.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Account email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="reason">
                    Reason for deletion{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input min-h-[80px] resize-none"
                    placeholder="Let us know why you're leaving..."
                    rows={3}
                  />
                </div>

                <button type="submit" className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors">
                  Submit deletion request
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                Requests are processed within 30 days. You will receive a confirmation email when your account has been deleted.
              </p>

              <p className="mt-3 text-center text-sm text-gray-500">
                Changed your mind?{' '}
                <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
                  Go back
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
