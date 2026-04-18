import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { publicClient } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SEO } from '../components/SEO';

interface PublicInvoice {
  clientName?: string | null;
  clientEmail?: string | null;
  amount?: number | null;
  status?: string | null;
  dueDate?: string | null;
  publicId?: string | null;
  businessName?: string | null;
  payid?: string | null;
  found?: boolean | null;
}

export function PublicInvoicePage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) { setError('Invalid invoice link'); setLoading(false); return; }

    publicClient.queries
      .getPublicInvoice({ publicId })
      .then((result) => {
        const data = result.data as PublicInvoice | null | undefined;
        if (!data || !data.found) {
          setError('Invoice not found or no longer public');
        } else {
          setInvoice(data);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
        setError('Failed to load invoice');
      })
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO title="View Invoice" noIndex />
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80">
          <img src="/schmappslogo.png" alt="Schmapps logo" className="w-7 h-7 rounded-md object-cover" />
          <span className="font-bold text-gray-900 text-sm">Invoices & Expenses</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-1">Invoice not found</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : invoice ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-5 ${
              invoice.status === 'paid'
                ? 'bg-green-50 border-b border-green-100'
                : 'bg-amber-50 border-b border-amber-100'
            }`}>
              <div className="flex items-center gap-3">
                {invoice.status === 'paid' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-500" />
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invoice</p>
                  <p className={`text-2xl font-bold ${
                    invoice.status === 'paid' ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {formatCurrency(invoice.amount ?? 0, 'AUD')}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {invoice.status === 'paid' ? 'Paid' : 'Payment due'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              <Row label="Client" value={invoice.clientName} />
              {invoice.clientEmail && <Row label="Email" value={invoice.clientEmail} />}
              {invoice.businessName && <Row label="From" value={invoice.businessName} />}
              <Row label="Due date" value={formatDate(invoice.dueDate)} />

              {invoice.payid && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">PayID</p>
                  <p className="text-sm font-mono text-blue-900">{invoice.payid}</p>
                  <p className="text-xs text-blue-600 mt-1">Use this PayID to make a bank transfer payment</p>
                </div>
              )}

              {invoice.status !== 'paid' && (
                <div className="pt-2 text-xs text-gray-400 text-center">
                  Reference: <span className="font-mono">{invoice.publicId}</span>
                </div>
              )}
            </div>

            <div className="px-6 pb-5 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
              Powered by{' '}
              <a href="https://invoicesandexpenses.com" className="text-brand-600 hover:underline font-medium">
                Invoices & Expenses
              </a>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}
