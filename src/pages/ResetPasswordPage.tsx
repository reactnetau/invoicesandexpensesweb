import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { SEO } from '../components/SEO';

export function ResetPasswordPage() {
  const { confirmForgotPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = sessionStorage.getItem('reset_email') ?? '';
    setEmail(e);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await confirmForgotPassword(email, code, password);
      sessionStorage.removeItem('reset_email');
      toast.success('Password reset — please sign in');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <SEO title="Reset Password" noIndex />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
      <p className="text-sm text-gray-500 mb-6">Enter the code we sent to your email</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!email && (
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="code">Reset code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input text-center tracking-widest text-xl font-mono"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
