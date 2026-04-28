import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Receipt, BarChart2, Mail, Check, ArrowRight, Zap, Star } from 'lucide-react';
import { SEO } from '../components/SEO';
import { CrossPlatformNote } from '../components/CrossPlatformNote';
import { publicClient } from '../lib/api';

const APP_URL = import.meta.env.VITE_APP_URL ?? '';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL || undefined,
      name: 'Invoices & Expenses',
      description: 'Free invoicing and expense tracking for freelancers and contractors',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Invoices & Expenses',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free Plan' },
        { '@type': 'Offer', price: '7', priceCurrency: 'USD', name: 'Pro Plan' },
      ],
      description: 'Simple invoice and expense tracking for freelancers and contractors.',
      url: APP_URL || undefined,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Invoices & Expenses free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The free plan lets you create up to 5 invoices per month with unlimited expense tracking. The Pro plan is $7/month for unlimited invoices and CSV export.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who is Invoices & Expenses for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Invoices & Expenses is built for freelancers, contractors, and small business owners who want simple invoicing and expense tracking without complex accounting software.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I send invoices as PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can generate and email a PDF invoice directly to your client from the invoices page.',
          },
        },
      ],
    },
  ],
};

const features = [
  {
    icon: FileText,
    title: 'Send polished invoices',
    desc: 'Create client-ready invoices with clean PDFs and email delivery.',
  },
  {
    icon: Receipt,
    title: 'Track expenses easily',
    desc: 'Log business expenses by category. Know exactly what you\'re spending.',
  },
  {
    icon: BarChart2,
    title: 'Know your numbers',
    desc: 'Track income, expenses, and net profit for any financial year.',
  },
  {
    icon: Mail,
    title: 'PDF email delivery',
    desc: 'Attach your invoice as a PDF and email it to clients directly.',
  },
  {
    icon: Zap,
    title: 'AI financial summaries',
    desc: 'Get plain-English summaries of your financial year — powered by Claude.',
  },
];

const ACTIVITY = [
  { title: 'Invoice sent', meta: 'Design retainer · $1,250', dot: 'bg-brand-500' },
  { title: 'Expense logged', meta: 'Software · $49', dot: 'bg-green-500' },
  { title: 'Client added', meta: 'Aster Studio', dot: 'bg-amber-500' },
];

type FoundingStatus = {
  claimed: number;
  limit: number;
  available: number;
};

export function LandingPage() {
  const [foundingStatus, setFoundingStatus] = useState<FoundingStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFoundingStatus() {
      try {
        const result = await publicClient.queries.getFoundingMemberStatus();
        const data = result.data;
        if (
          !cancelled &&
          data &&
          typeof data.claimed === 'number' &&
          typeof data.limit === 'number' &&
          typeof data.available === 'number' &&
          data.claimed < data.limit
        ) {
          setFoundingStatus({
            claimed: data.claimed,
            limit: data.limit,
            available: data.available,
          });
        }
      } catch {
        if (!cancelled) setFoundingStatus(null);
      }
    }

    void loadFoundingStatus();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <SEO
        title="Free Invoicing &amp; Expense Tracking for Freelancers"
        description="Create professional invoices, track expenses, and see your profit instantly. Free invoicing software built for freelancers and contractors. No accounting knowledge needed."
        canonical="/"
        jsonLd={jsonLd}
      />

      {/* ── Nav ── */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/schmappslogo.png" alt="Schmapps logo" className="w-8 h-8 rounded-[10px] object-cover" />
            <span className="font-bold text-gray-900 text-sm">Invoices & Expenses</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <img src="/schmappslogo.png" alt="Schmapps logo" className="w-20 h-20 rounded-[20px] object-cover mx-auto mb-6 shadow-md" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6">
          <Zap className="w-3 h-3" /> Freelance finance
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
          Invoices & expenses,{' '}
          <span className="text-brand-600">the simple way</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Send invoices, record costs, and see what you actually earned — without wrestling a spreadsheet.
        </p>

        <div className="flex gap-3 justify-center flex-wrap mb-6">
          <Link to="/signup" className="btn-primary !text-base !py-3 !px-7">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary !text-base !py-3 !px-6">
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-400">No credit card required · 5 free invoices/month</p>

        <div className="mx-auto mt-6 max-w-md">
          <CrossPlatformNote />
        </div>

        {foundingStatus && (
          <div className="mt-6 mx-auto max-w-md rounded-card border border-amber-200 bg-white p-4 shadow-card text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-amber-200 bg-amber-50">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-gray-900">Founding memberships</p>
                  <p className="text-xs font-semibold text-amber-700">{foundingStatus.available} left</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${Math.min((foundingStatus.claimed / foundingStatus.limit) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {foundingStatus.claimed}/{foundingStatus.limit} claimed. Founding members get permanent Pro free.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Stats band ── */}
      <div className="border-y border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '$0', label: 'Free to start' },
            { value: '5',  label: 'Invoices free' },
            { value: '$7', label: 'Pro monthly' },
            { value: '50', label: 'Founder spots' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-brand-600 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-extrabold text-brand-600 uppercase tracking-widest text-center mb-2">Daily workflow</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">Everything stays tidy</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="icon-box-md mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark panel — live snapshot ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-gray-900 p-7 sm:p-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-400/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Live snapshot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Your week at a glance</h2>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">
            A simple activity feed keeps the admin work visible and under control.
          </p>
          <div className="space-y-3">
            {ACTIVITY.map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3.5">
                <div className="w-8 h-8 rounded-[8px] bg-brand-600/25 flex items-center justify-center flex-shrink-0">
                  <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.meta}</p>
                </div>
                <span className="text-xs text-gray-600">now</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-extrabold text-brand-600 uppercase tracking-widest text-center mb-2">Simple pricing</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">Start free, grow when ready</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={['5 invoices per month', 'Unlimited expenses', 'Unlimited clients', 'PDF invoice download']}
            />
            <PricingCard
              name="Pro"
              price="$7"
              period="per month"
              features={['Unlimited invoices', 'Everything in Free', 'PDF + email delivery', 'CSV export', 'AI financial summaries']}
              highlighted
            />
          </div>
          {foundingStatus && (
            <p className="text-center text-sm text-gray-400 mt-6">
              {foundingStatus.available} founding memberships left for permanent Pro free.
            </p>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Join freelancers and small business owners who use Invoices & Expenses every day.
          </p>
          <Link to="/signup" className="btn-primary !text-base !py-3 !px-8">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-sm text-gray-400">No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2.5">
            <img src="/schmappslogo.png" alt="Schmapps logo" className="w-6 h-6 rounded-[8px] object-cover" />
            <span className="font-semibold text-gray-600">Invoices & Expenses</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link to="/support" className="hover:text-gray-600 transition-colors">Support</Link>
            <Link to="/delete-account" className="hover:text-gray-600 transition-colors">Delete account</Link>
            <span>© {new Date().getFullYear()} Invoices & Expenses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  name, price, period, features, highlighted,
}: {
  name: string; price: string; period: string;
  features: string[]; highlighted?: boolean;
}) {
  return (
    <div className={`rounded-card border p-7 flex flex-col ${
      highlighted
        ? 'bg-brand-600 border-brand-600 shadow-md text-white'
        : 'bg-white border-gray-200 shadow-card'
    }`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
        {name}
      </p>
      <div className="flex items-baseline gap-1 mb-5">
        <span className={`text-4xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900'}`}>{price}</span>
        <span className={`text-sm ${highlighted ? 'text-blue-200' : 'text-gray-400'}`}>/{period}</span>
      </div>
      <ul className="space-y-2.5 flex-1 mb-7">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm">
            <Check className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-blue-200' : 'text-green-600'}`} />
            <span className={highlighted ? 'text-blue-100' : 'text-gray-600'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block text-center py-2.5 rounded-btn font-semibold text-sm transition-colors ${
          highlighted
            ? 'bg-white text-brand-700 hover:bg-blue-50'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {highlighted ? 'Get Pro' : 'Sign up free'}
      </Link>
    </div>
  );
}
