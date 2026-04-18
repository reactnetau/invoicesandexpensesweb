import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function StripeSuccessPage() {
  const { fetchProfile } = useProfile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchProfile().finally(() => setReady(true));
  }, [fetchProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="card p-10 max-w-md w-full text-center shadow-md">
        {!ready ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're on Pro!</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your subscription is active. Enjoy unlimited invoices, CSV export, and AI summaries.
            </p>
            <Link to="/dashboard" className="btn-primary !text-base !py-3 !px-8">
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
