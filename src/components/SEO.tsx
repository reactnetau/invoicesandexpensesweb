import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Invoices & Expenses';
const DEFAULT_DESCRIPTION =
  'Create professional invoices, track expenses, and see your profit instantly. Free invoicing software built for freelancers and contractors.';
const APP_URL = import.meta.env.VITE_APP_URL ?? '';

interface SEOProps {
  /** Page title — will be rendered as "Page | Invoices & Expenses" */
  title?: string;
  description?: string;
  /** Absolute or root-relative path for canonical URL, e.g. "/" or "/support" */
  canonical?: string;
  /** Prevent indexing — use for auth, account, and utility pages */
  noIndex?: boolean;
  ogType?: string;
  /** Structured data to inject as application/ld+json */
  jsonLd?: object;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noIndex = false,
  ogType = 'website',
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${APP_URL}${canonical}` : undefined;
  const ogImage = `${APP_URL}/schmappslogo.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
