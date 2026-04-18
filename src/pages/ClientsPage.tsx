import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, X, Check } from 'lucide-react';
import { client, type Client } from '../lib/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { enqueueSnackbar } from 'notistack';
import { SEO } from '../components/SEO';

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

const emptyForm: ClientForm = { name: '', email: '', phone: '', company: '', address: '' };

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client.models.Client.list();
      const sorted = [...(result.data ?? [])].sort(
        (a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1
      );
      setClients(sorted as unknown as Client[]);
    } catch {
      enqueueSnackbar('Failed to load clients', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setFormOpen(true); };
  const openEdit = (c: Client) => {
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', address: c.address ?? '' });
    setEditingId(c.id);
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { enqueueSnackbar('Name is required', { variant: 'error' }); return; }
    setSaving(true);
    try {
      if (editingId) {
        await client.models.Client.update({
          id: editingId,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          address: form.address || undefined,
        });
        enqueueSnackbar('Client updated', { variant: 'success' });
      } else {
        await client.models.Client.create({
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          address: form.address || undefined,
        });
        enqueueSnackbar('Client added', { variant: 'success' });
      }
      closeForm();
      fetchClients();
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await client.models.Client.delete({ id: deleteId });
      enqueueSnackbar('Client deleted', { variant: 'success' });
      setDeleteId(null);
      fetchClients();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <SEO title="Clients" noIndex />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add client
        </button>
      </div>

      {/* Add/Edit form */}
      {formOpen && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {editingId ? 'Edit client' : 'New client'}
            </h2>
            <button onClick={closeForm} className="p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> Save client</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : clients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No clients yet</p>
            <p className="text-sm text-gray-400 mb-5">Add your first client to get started</p>
            <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add client
          </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {clients.map((c, idx) => (
            <div
              key={c.id}
              className={`flex items-center gap-4 px-4 py-4 ${idx !== clients.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-brand-600">{c.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {[c.email, c.company].filter(Boolean).join(' · ') || 'No contact details'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete client"
        message="This will permanently delete this client. Invoices referencing them will remain."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
