import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Receipt, X } from 'lucide-react';
import { client, type Expense } from '../lib/api';
import { useProfile } from '../hooks/useProfile';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '../lib/format';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export function ExpensesPage() {
  const { profile, fetchProfile } = useProfile();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Software', amount: '', date: todayISO() });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currency = profile?.currency ?? 'USD';

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      await fetchProfile();
      const result = await client.models.Expense.list();
      const sorted = [...(result.data ?? [])].sort(
        (a, b) => (b.date ?? '') > (a.date ?? '') ? 1 : -1
      );
      setExpenses(sorted as unknown as Expense[]);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await client.models.Expense.create({
        category: form.category,
        amount: amt,
        date: new Date(form.date).toISOString(),
      });
      toast.success('Expense added');
      setFormOpen(false);
      setForm({ category: 'Software', amount: '', date: todayISO() });
      fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await client.models.Expense.delete({ id: deleteId });
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              Total: <span className="font-semibold text-red-600">{formatCurrency(total, currency)}</span>
            </p>
          )}
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {/* Add form */}
      {formOpen && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">New expense</h2>
            <button onClick={() => setFormOpen(false)} className="p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount</label>
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
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Adding…' : 'Add expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : expenses.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No expenses yet</p>
          <p className="text-sm text-gray-400 mt-1">Track your business expenses here</p>
          <button onClick={() => setFormOpen(true)} className="btn-primary mt-4 mx-auto">
            <Plus className="w-4 h-4" /> Add expense
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {expenses.map((exp, idx) => (
            <div
              key={exp.id}
              className={`flex items-center gap-4 px-4 py-4 ${idx !== expenses.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{exp.category}</p>
                <p className="text-sm text-gray-400">{formatDate(exp.date)}</p>
              </div>
              <p className="font-semibold text-red-600 mr-2">
                -{formatCurrency(exp.amount, currency)}
              </p>
              <button
                onClick={() => setDeleteId(exp.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete expense"
        message="This expense will be permanently deleted."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}
