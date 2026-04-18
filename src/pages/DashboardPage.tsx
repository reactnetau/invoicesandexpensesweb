import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle,
  Download, Sparkles, RefreshCw, Star,
} from 'lucide-react';
import { client, isPro, type Invoice, type Expense } from '../lib/api';
import { useProfile } from '../hooks/useProfile';
import {
  formatCurrency, formatDate, fyLabel, fyDates,
  getAvailableFinancialYears, getCurrentFyStartYear,
} from '../lib/format';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProModal } from '../components/ProModal';
import { enqueueSnackbar } from 'notistack';
import { SEO } from '../components/SEO';

export function DashboardPage() {
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedFyStart, setSelectedFyStart] = useState(getCurrentFyStartYear());
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [proModal, setProModal] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const fyYears = getAvailableFinancialYears(4);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      await fetchProfile();
      const [invRes, expRes] = await Promise.all([
        client.models.Invoice.list(),
        client.models.Expense.list(),
      ]);
      setInvoices((invRes.data ?? []) as unknown as Invoice[]);
      setExpenses((expRes.data ?? []) as unknown as Expense[]);
    } catch (err) {
      enqueueSnackbar('Failed to load data', { variant: 'error' });
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => { loadData(); }, [loadData]);

  const { start, end } = fyDates(selectedFyStart);
  const fyInvoices = invoices.filter((inv) => {
    const d = new Date(inv.createdAt ?? inv.dueDate);
    return d >= start && d < end;
  });
  const fyExpenses = expenses.filter((exp) => {
    const d = new Date(exp.date);
    return d >= start && d < end;
  });

  const income = fyInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const expenseTotal = fyExpenses.reduce((s, e) => s + e.amount, 0);
  const profit = income - expenseTotal;
  const unpaidInvoices = fyInvoices.filter((i) => i.status !== 'paid');
  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const currency = profile?.currency ?? 'USD';
  const userIsPro = profile ? isPro(profile) : false;

  // monthly invoice count for free plan banner
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyCount = invoices.filter((inv) => new Date(inv.createdAt ?? '') >= monthStart).length;
  const FREE_LIMIT = 5;

  const recentInvoices = [...fyInvoices]
    .sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1)
    .slice(0, 5);
  const recentExpenses = [...fyExpenses]
    .sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1)
    .slice(0, 5);

  const handleAiSummary = async () => {
    setAiLoading(true);
    setAiSummary(null);
    try {
      const result = await client.queries.getAiSummary({ fyStart: selectedFyStart });
      if (result.data?.summary) {
        setAiSummary(result.data.summary);
      } else if (result.data?.error) {
        enqueueSnackbar(result.data.error, { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('Failed to get AI summary', { variant: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCsvExport = async () => {
    if (!userIsPro) {
      setProModal({ open: true, reason: 'CSV export is a Pro feature.' });
      return;
    }
    setCsvLoading(true);
    try {
      const result = await client.queries.exportCsv({ fyStart: selectedFyStart });
      if (result.data?.error === 'pro_required') {
        setProModal({ open: true, reason: 'CSV export requires a Pro subscription.' });
        return;
      }
      const content = result.data?.content;
      if (!content) throw new Error('No CSV data returned');
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-expenses-${selectedFyStart}-${selectedFyStart + 1}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      enqueueSnackbar('CSV downloaded', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Export failed', { variant: 'error' });
    } finally {
      setCsvLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const result = await client.queries.stripeCreateCheckout();
      const url = result.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        enqueueSnackbar(result.data?.error ?? 'Failed to start checkout', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('Upgrade failed', { variant: 'error' });
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (profileLoading && !profile) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SEO title="Dashboard" noIndex />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {profile?.businessName && (
            <p className="text-sm text-gray-500 mt-0.5">{profile.businessName}</p>
          )}
        </div>
        <button onClick={loadData} disabled={dataLoading} className="btn-secondary !py-2 !px-3">
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Plan badge */}
      {profile && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-5 border ${
          userIsPro ? 'badge-pro' : 'badge-free'
        }`}>
          <Star className="w-3 h-3" />
          {profile.isFoundingMember
            ? 'Founding member — Pro forever'
            : userIsPro
            ? 'Pro plan'
            : `Free plan · ${monthlyCount}/${FREE_LIMIT} invoices this month`}
          {!userIsPro && (
            <button
              onClick={() => setProModal({ open: true, reason: '' })}
              className="ml-1 text-brand-600 font-bold hover:underline"
            >
              Upgrade
            </button>
          )}
        </div>
      )}

      {/* FY selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {fyYears.map((year) => (
          <button
            key={year}
            onClick={() => { setSelectedFyStart(year); setAiSummary(null); }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedFyStart === year
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
            }`}
          >
            {fyLabel(year)}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Income"
              value={formatCurrency(income, currency)}
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              color="green"
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(expenseTotal, currency)}
              icon={<TrendingDown className="w-5 h-5 text-red-500" />}
              color="red"
            />
            <StatCard
              label="Net Profit"
              value={formatCurrency(profit, currency)}
              icon={<DollarSign className={`w-5 h-5 ${profit >= 0 ? 'text-brand-600' : 'text-red-500'}`} />}
              color={profit >= 0 ? 'blue' : 'red'}
            />
            <StatCard
              label="Unpaid"
              value={formatCurrency(unpaidTotal, currency)}
              subtitle={`${unpaidInvoices.length} invoice${unpaidInvoices.length !== 1 ? 's' : ''}`}
              icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
              color="amber"
            />
          </div>

          {/* Actions row */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={handleCsvExport}
              disabled={csvLoading}
              className="btn-secondary !text-brand-600"
            >
              {csvLoading ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}
              CSV export
              {!userIsPro && <span className="ml-1 text-xs text-gray-400">· Pro</span>}
            </button>
            <button
              onClick={handleAiSummary}
              disabled={aiLoading}
              className="btn-secondary !text-brand-600"
            >
              {aiLoading ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
              AI summary
            </button>
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="card p-5 mb-6 border-brand-200 bg-brand-50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-brand-700">AI financial summary — {fyLabel(selectedFyStart)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
            </div>
          )}

          {/* Recent invoices */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent invoices</h2>
              <a href="/invoices" className="text-sm text-brand-600 font-medium hover:underline">See all</a>
            </div>
            {recentInvoices.length === 0 ? (
              <EmptyState text={`No invoices in ${fyLabel(selectedFyStart)}`} />
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Due</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{inv.clientName}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(inv.dueDate)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.amount, currency)}</td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent expenses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent expenses</h2>
              <a href="/expenses" className="text-sm text-brand-600 font-medium hover:underline">See all</a>
            </div>
            {recentExpenses.length === 0 ? (
              <EmptyState text={`No expenses in ${fyLabel(selectedFyStart)}`} />
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Date</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{exp.category}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(exp.date)}</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          -{formatCurrency(exp.amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <ProModal
        open={proModal.open}
        reason={proModal.reason}
        loading={upgradeLoading}
        onUpgrade={handleUpgrade}
        onClose={() => setProModal({ open: false, reason: '' })}
      />
    </div>
  );
}

function StatCard({
  label, value, subtitle, icon, color,
}: {
  label: string; value: string; subtitle?: string;
  icon: React.ReactNode; color: 'green' | 'red' | 'blue' | 'amber';
}) {
  const bg = {
    green: 'bg-green-50 border-green-100',
    red:   'bg-red-50 border-red-100',
    blue:  'bg-brand-50 border-brand-100',
    amber: 'bg-amber-50 border-amber-100',
  }[color];
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-[10px] border flex items-center justify-center mb-3 ${bg}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
      {status === 'paid' ? 'Paid' : 'Unpaid'}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
