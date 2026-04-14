import { Link } from 'react-router-dom';
import {
  Zap, FileText, Receipt, BarChart2, Globe, Mail,
  Check, Star, ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Professional invoices',
    desc: 'Create clean invoices in seconds. Send PDF invoices to clients via email — straight from the app.',
  },
  {
    icon: Receipt,
    title: 'Expense tracking',
    desc: 'Log business expenses by category. See your real costs at a glance across any date range.',
  },
  {
    icon: BarChart2,
    title: 'Profit dashboard',
    desc: 'See income, expenses, and net profit for any Australian financial year. Know where you stand.',
  },
  {
    icon: Globe,
    title: 'Public invoice links',
    desc: 'Every invoice gets a unique public URL you can share with clients — no login required to view.',
  },
  {
    icon: Mail,
    title: 'PDF email delivery',
    desc: 'Attach your invoice as a PDF and email it to clients directly. Include your PayID for easy payment.',
  },
  {
    icon: Star,
    title: 'AI financial summaries',
    desc: 'Get plain-English AI summaries of your financial year — powered by Claude. Pro plan feature.',
  },
];

const freePlan = {
  name: 'Free',
  price: '$0',
  period: 'forever',
  features: [
    '5 invoices per month',
    'Unlimited expenses',
    'Unlimited clients',
    'Public invoice links',
    'PDF invoice download',
  ],
};

const proPlan = {
  name: 'Pro',
  price: '$7',
  period: 'per month',
  features: [
    'Unlimited invoices',
    'Everything in Free',
    'PDF + email delivery',
    'CSV export',
    'AI financial summaries',
    'Priority support',
  ],
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Invoices & Expenses</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-6">
          <Star className="w-3 h-3" /> Simple invoicing for freelancers
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Invoicing & expenses,{' '}
          <span className="text-brand-600">the simple way</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Create professional invoices, track expenses, and understand your profit — built for freelancers, contractors, and small business owners.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="btn-primary !text-base !py-3 !px-6">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary !text-base !py-3 !px-6">
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required · 5 free invoices/month</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Everything you need</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            From sending your first invoice to understanding your annual profit — we've got you covered.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Simple pricing</h2>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you're ready.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <PricingCard plan={freePlan} />
            <PricingCard plan={proPlan} highlighted />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-brand-200 mb-8 text-lg">
            Join freelancers and small business owners who use Invoices & Expenses every day.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors text-base">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-600">Invoices & Expenses</span>
          </div>
          <p>© {new Date().getFullYear()} Invoices & Expenses. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
}

function PricingCard({ plan, highlighted }: { plan: Plan; highlighted?: boolean }) {
  return (
    <div className={`rounded-xl border p-8 flex flex-col ${
      highlighted
        ? 'bg-brand-600 border-brand-600 text-white shadow-xl'
        : 'bg-white border-gray-200'
    }`}>
      <p className={`text-sm font-semibold mb-3 ${highlighted ? 'text-brand-200' : 'text-gray-500'}`}>
        {plan.name}
      </p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-4xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
          {plan.price}
        </span>
        <span className={`text-sm ${highlighted ? 'text-brand-200' : 'text-gray-400'}`}>
          /{plan.period}
        </span>
      </div>
      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm">
            <Check className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-brand-200' : 'text-green-500'}`} />
            <span className={highlighted ? 'text-brand-100' : 'text-gray-600'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`mt-8 block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
          highlighted
            ? 'bg-white text-brand-700 hover:bg-brand-50'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {highlighted ? 'Get started' : 'Sign up free'}
      </Link>
    </div>
  );
}
