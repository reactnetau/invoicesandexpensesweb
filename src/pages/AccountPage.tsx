import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CreditCard, AlertTriangle, Trash2 } from 'lucide-react';
import { client, isPro } from '../lib/api';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export function AccountPage() {
  const { profile, loading, fetchProfile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const userIsPro = profile ? isPro(profile) : false;
  const isFoundingMember = profile?.isFoundingMember ?? false;
  const subscriptionStatus = profile?.subscriptionStatus ?? 'inactive';

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const result = await client.queries.stripeCreateCheckout();
      if (result.data?.url) window.location.href = result.data.url;
      else toast.error(result.data?.error ?? 'Checkout failed');
    } catch {
      toast.error('Upgrade failed');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const result = await client.queries.stripeCreatePortal();
      if (result.data?.url) window.location.href = result.data.url;
      else toast.error(result.data?.error ?? 'Portal unavailable');
    } catch {
      toast.error('Portal unavailable');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const result = await client.mutations.stripeCancelSubscription();
      if (result.data?.ok) {
        toast.success('Subscription will cancel at period end');
        setCancelModal(false);
        fetchProfile();
      } else {
        toast.error(result.data?.error ?? 'Cancel failed');
      }
    } catch {
      toast.error('Cancel failed');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Delete all user data (profile, invoices, expenses, clients)
      if (profile) {
        await Promise.all([
          client.models.UserProfile.delete({ id: profile.id }),
        ]);
      }
      await logout();
      navigate('/');
      toast.success('Account deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !profile) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

      {/* Account info */}
      <div className="card p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Account details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{profile?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Membership</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${
              isFoundingMember ? 'text-amber-600' : userIsPro ? 'text-brand-600' : 'text-gray-600'
            }`}>
              <Star className="w-3.5 h-3.5" />
              {isFoundingMember ? 'Founding member — Pro forever' : userIsPro ? 'Pro' : 'Free'}
            </span>
          </div>
          {subscriptionStatus && subscriptionStatus !== 'inactive' && (
            <div className="flex justify-between">
              <span className="text-gray-500">Subscription</span>
              <span className="text-gray-700 capitalize">{subscriptionStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subscription actions */}
      <div className="card p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription</h2>

        {isFoundingMember ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Star className="w-4 h-4" /> Founding member
            </div>
            You have lifetime Pro access. Thank you for being an early supporter!
          </div>
        ) : userIsPro ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">You're on the Pro plan ($7/month). Manage your billing below.</p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary">
                <CreditCard className="w-4 h-4" />
                {portalLoading ? 'Loading…' : 'Manage billing'}
              </button>
              <button
                onClick={() => setCancelModal(true)}
                disabled={cancelLoading}
                className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50"
              >
                {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              You're on the <strong>Free plan</strong> — 5 invoices per month. Upgrade to Pro for unlimited invoices, CSV export, and AI summaries.
            </p>
            <button onClick={handleUpgrade} disabled={upgradeLoading} className="btn-primary">
              {upgradeLoading ? 'Redirecting…' : <><Star className="w-4 h-4" /> Upgrade to Pro — $7/month</>}
            </button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-200">
        <h2 className="text-base font-semibold text-red-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger zone
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting your account is permanent and cannot be undone. All invoices, expenses, and client data will be lost.
          {userIsPro && !isFoundingMember && ' Cancel your subscription first before deleting.'}
        </p>
        <button
          onClick={() => setDeleteModal(true)}
          disabled={userIsPro && !isFoundingMember}
          className="btn-danger"
          title={userIsPro && !isFoundingMember ? 'Cancel your subscription before deleting your account' : ''}
        >
          <Trash2 className="w-4 h-4" /> Delete account
        </button>
        {userIsPro && !isFoundingMember && (
          <p className="text-xs text-gray-400 mt-2">Cancel your subscription first to enable account deletion.</p>
        )}
      </div>

      <ConfirmModal
        open={cancelModal}
        title="Cancel subscription"
        message="Your Pro access will continue until the end of the current billing period, then you'll revert to the free plan."
        confirmLabel="Cancel subscription"
        loading={cancelLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
      />

      <ConfirmModal
        open={deleteModal}
        title="Delete account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete account"
        loading={deleteLoading}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
}
