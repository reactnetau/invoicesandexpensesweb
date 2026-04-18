import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, FileText, X, Link2, CheckCircle, Circle,
  Mail, Eye, Send,
} from 'lucide-react';
import { client, isPro, type Invoice, type Client } from '../lib/api';
import { useProfile } from '../hooks/useProfile';
import { formatCurrency, formatDate } from '../lib/format';
import { ConfirmModal } from '../components/ConfirmModal';
import { ProModal } from '../components/ProModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { enqueueSnackbar } from 'notistack';
import { SEO } from '../components/SEO';

const FREE_LIMIT = 5;
const APP_URL = 'https://invoicesandexpenses.com';

export function InvoicesPage() {
  const { profile, fetchProfile } = useProfile();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [proModal, setProModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [emailModal, setEmailModal] = useState<{ open: boolean; invoice: Invoice | null }>({ open: false, invoice: null });
  const [emailSending, setEmailSending] = useState(false);

  const [form, setForm] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    amount: '',
    dueDate: defaultDueDate(),
    sendEmail: false,
    includeBusinessName: true,
    includeFullName: true,
    includePhone: false,
    includeAddress: false,
    includeAbn: false,
    includePayid: false,
  });

  const [emailOpts, setEmailOpts] = useState({
    includeBusinessName: true,
    includeFullName: true,
    includePhone: false,
    includeAddress: false,
    includeAbn: false,
    includePayid: false,
  });

  const currency = profile?.currency ?? 'USD';
  const userIsPro = profile ? isPro(profile) : false;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyCount = invoices.filter((inv) => new Date(inv.createdAt ?? '') >= monthStart).length;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await fetchProfile();
      const [invRes, clientRes] = await Promise.all([
        client.models.Invoice.list(),
        client.models.Client.list(),
      ]);
      const sorted = [...(invRes.data ?? [])].sort(
        (a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1
      );
      setInvoices(sorted as unknown as Invoice[]);
      setClients((clientRes.data ?? []) as unknown as Client[]);
    } catch {
      enqueueSnackbar('Failed to load invoices', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleClientSelect = (id: string) => {
    const c = clients.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      clientId: id,
      clientName: c?.name ?? f.clientName,
      clientEmail: c?.email ?? f.clientEmail,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) { enqueueSnackbar('Client name is required', { variant: 'error' }); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { enqueueSnackbar('Enter a valid amount', { variant: 'error' }); return; }

    setSaving(true);
    try {
      const result = await client.mutations.createInvoice({
        clientId: form.clientId || undefined,
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        amount: amt,
        dueDate: new Date(form.dueDate).toISOString(),
        sendEmail: form.sendEmail,
        includeBusinessName: form.includeBusinessName,
        includeFullName: form.includeFullName,
        includePhone: form.includePhone,
        includeAddress: form.includeAddress,
        includeAbn: form.includeAbn,
        includePayid: form.includePayid,
      });

      if (result.data?.errorCode === 'limit_reached') {
        setProModal(true);
        return;
      }
      if (result.data?.error) {
        enqueueSnackbar(result.data.error, { variant: 'error' });
        return;
      }

      if (result.data?.emailSent) {
        enqueueSnackbar('Invoice created and email sent', { variant: 'success' });
      } else if (result.data?.emailError) {
        enqueueSnackbar('Invoice created, but email failed: ' + result.data.emailError, { variant: 'warning' });
      } else {
        enqueueSnackbar('Invoice created', { variant: 'success' });
      }

      setFormOpen(false);
      resetForm();
      fetchAll();
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Create failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      clientId: '', clientName: '', clientEmail: '', amount: '',
      dueDate: defaultDueDate(), sendEmail: false,
      includeBusinessName: true, includeFullName: true,
      includePhone: false, includeAddress: false, includeAbn: false, includePayid: false,
    });
  };

  const handleTogglePaid = async (inv: Invoice) => {
    const newStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    try {
      await client.models.Invoice.update({
        id: inv.id,
        status: newStatus,
        paidAt: newStatus === 'paid' ? new Date().toISOString() : null,
      });
      enqueueSnackbar(newStatus === 'paid' ? 'Marked as paid' : 'Marked as unpaid', { variant: 'success' });
      fetchAll();
    } catch {
      enqueueSnackbar('Failed to update invoice', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await client.models.Invoice.delete({ id: deleteId });
      enqueueSnackbar('Invoice deleted', { variant: 'success' });
      setDeleteId(null);
      fetchAll();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = (publicId: string) => {
    const url = `${APP_URL}/invoice/${publicId}`;
    navigator.clipboard.writeText(url);
    enqueueSnackbar('Public link copied', { variant: 'success' });
  };

  const handleSendEmail = async () => {
    if (!emailModal.invoice) return;
    setEmailSending(true);
    try {
      const result = await client.mutations.sendInvoiceEmail({
        invoiceId: emailModal.invoice.id,
        ...emailOpts,
      });
      if (result.data?.ok) {
        enqueueSnackbar('Email sent', { variant: 'success' });
        setEmailModal({ open: false, invoice: null });
      } else {
        enqueueSnackbar(result.data?.error ?? 'Email failed', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Email failed', { variant: 'error' });
    } finally {
      setEmailSending(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const ensuredProfile = profile ?? await fetchProfile();
      if (!ensuredProfile) {
        enqueueSnackbar('We could not load your account profile. Please refresh and try again.', { variant: 'error' });
        return;
      }
      const result = await client.queries.stripeCreateCheckout();
      if (result.data?.url) window.location.href = result.data.url;
      else enqueueSnackbar(result.data?.error ?? 'Checkout failed', { variant: 'error' });
    } catch {
      enqueueSnackbar('Upgrade failed', { variant: 'error' });
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SEO title="Invoices" noIndex />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          {!userIsPro && !loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {monthlyCount}/{FREE_LIMIT} invoices this month
            </p>
          )}
        </div>
        <button
          onClick={() => {
            if (!userIsPro && monthlyCount >= FREE_LIMIT) {
              setProModal(true);
              return;
            }
            setFormOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New invoice
        </button>
      </div>

      {/* Limit warning */}
      {!userIsPro && monthlyCount >= FREE_LIMIT && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-3">
          <span>You've reached your 5 invoices/month limit on the free plan.</span>
          <button onClick={() => setProModal(true)} className="font-semibold text-brand-600 hover:underline whitespace-nowrap">
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* New invoice form */}
      {formOpen && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">New invoice</h2>
            <button onClick={() => { setFormOpen(false); resetForm(); }} className="p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Client</label>
                {clients.length > 0 ? (
                  <select
                    className="input"
                    value={form.clientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                  >
                    <option value="">Select a client…</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="__manual">Enter manually</option>
                  </select>
                ) : null}
              </div>
              <div>
                <label className="label">Client name *</label>
                <input
                  className="input"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="label">Client email</label>
                <input
                  className="input"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="label">Amount *</label>
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Due date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email option */}
            {form.clientEmail && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendEmail}
                    onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send PDF invoice to {form.clientEmail}
                  </span>
                </label>
                {form.sendEmail && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
                    {[
                      ['includeBusinessName', 'Business name'],
                      ['includeFullName', 'Full name'],
                      ['includePhone', 'Phone'],
                      ['includeAddress', 'Address'],
                      ['includeAbn', 'ABN'],
                      ['includePayid', 'PayID'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(form as Record<string, unknown>)[key] as boolean}
                          onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                          className="w-3.5 h-3.5 accent-brand-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Creating…' : 'Create invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : invoices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No invoices yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first invoice to get started</p>
            <button onClick={() => setFormOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Due</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{inv.clientName}</p>
                    {inv.clientEmail && <p className="text-xs text-gray-400">{inv.clientEmail}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.amount, currency)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleTogglePaid(inv)}
                      className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                        inv.status === 'paid'
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {inv.status === 'paid'
                        ? <><CheckCircle className="w-3 h-3" /> Paid</>
                        : <><Circle className="w-3 h-3" /> Unpaid</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/invoice/${inv.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        title="View public invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(inv.publicId)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        title="Copy public link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      {inv.clientEmail && (
                        <button
                          onClick={() => setEmailModal({ open: true, invoice: inv })}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-600"
                          title="Send PDF email"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(inv.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email modal */}
      {emailModal.open && emailModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEmailModal({ open: false, invoice: null })} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button
              onClick={() => setEmailModal({ open: false, invoice: null })}
              className="absolute right-4 top-4 p-1 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-gray-900">Send invoice PDF</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Send to <span className="font-medium text-gray-700">{emailModal.invoice.clientEmail}</span>
            </p>
            <p className="text-xs text-gray-500 font-medium mb-2">Include in PDF:</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                ['includeBusinessName', 'Business name'],
                ['includeFullName', 'Full name'],
                ['includePhone', 'Phone'],
                ['includeAddress', 'Address'],
                ['includeAbn', 'ABN'],
                ['includePayid', 'PayID'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(emailOpts as Record<string, unknown>)[key] as boolean}
                    onChange={(e) => setEmailOpts({ ...emailOpts, [key]: e.target.checked })}
                    className="w-4 h-4 accent-brand-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <button onClick={handleSendEmail} disabled={emailSending} className="btn-primary w-full">
              {emailSending ? 'Sending…' : <><Send className="w-4 h-4" /> Send email</>}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete invoice"
        message="This invoice will be permanently deleted. The public link will stop working."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ProModal
        open={proModal}
        reason={`You've used ${monthlyCount}/${FREE_LIMIT} free invoices this month.`}
        loading={upgradeLoading}
        onUpgrade={handleUpgrade}
        onClose={() => setProModal(false)}
      />
    </div>
  );
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}
