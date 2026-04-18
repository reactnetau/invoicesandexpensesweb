/**
 * Typed Amplify Data client.
 *
 * We deliberately avoid importing the Schema type from the shared mobile
 * backend (which has pre-existing @aws-amplify/backend v1.x type-drift
 * errors). Instead we use `generateClient()` with explicit `as` casts for
 * each operation, keeping our domain interfaces here as the source of truth
 * for the web app.
 */
import { generateClient } from 'aws-amplify/data';

// Untyped base clients – we wrap every call with explicit casts below.
const _client = generateClient();
const _publicClient = generateClient({ authMode: 'apiKey' });

// ── Domain types ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  stripeCustomerId?: string | null;
  subscriptionProvider?: string | null;
  subscriptionStatus: string;
  subscriptionEndDate?: string | null;
  isFoundingMember: boolean;
  payidEncrypted?: string | null;
  currency: string;
  businessName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  abn?: string | null;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Invoice {
  id: string;
  clientId?: string | null;
  clientName: string;
  clientEmail?: string | null;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string | null;
  publicId: string;
  isPublic?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function isPro(
  profile: Pick<UserProfile, 'subscriptionStatus' | 'isFoundingMember'>
): boolean {
  return profile.isFoundingMember === true || profile.subscriptionStatus === 'active';
}

// ── Result helpers ────────────────────────────────────────────────────────────

type ListResult<T> = { data: T[] | null };
type ItemResult<T> = { data: T | null };

function getReturnUrl() {
  if (typeof window !== 'undefined') return window.location.origin;

  const appUrl = import.meta.env.VITE_APP_URL?.trim();
  if (!appUrl) return undefined;
  return /^https?:\/\//i.test(appUrl) ? appUrl.replace(/\/+$/, '') : `https://${appUrl.replace(/\/+$/, '')}`;
}

// ── Typed client ─────────────────────────────────────────────────────────────
// We re-export a `client` object with the same surface area as the
// generateClient<Schema>() client the mobile app uses, but fully typed here.

/* eslint-disable @typescript-eslint/no-explicit-any */
const models = {
  UserProfile: {
    list: () => (_client as any).models.UserProfile.list() as Promise<ListResult<UserProfile>>,
    create: (input: Omit<UserProfile, 'id'>) =>
      (_client as any).models.UserProfile.create(input) as Promise<ItemResult<UserProfile>>,
    update: (input: Partial<UserProfile> & { id: string }) =>
      (_client as any).models.UserProfile.update(input) as Promise<ItemResult<UserProfile>>,
    delete: (input: { id: string }) =>
      (_client as any).models.UserProfile.delete(input) as Promise<ItemResult<UserProfile>>,
  },
  Client: {
    list: () => (_client as any).models.Client.list() as Promise<ListResult<Client>>,
    create: (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) =>
      (_client as any).models.Client.create(input) as Promise<ItemResult<Client>>,
    update: (input: Partial<Client> & { id: string }) =>
      (_client as any).models.Client.update(input) as Promise<ItemResult<Client>>,
    delete: (input: { id: string }) =>
      (_client as any).models.Client.delete(input) as Promise<ItemResult<Client>>,
  },
  Invoice: {
    list: () => (_client as any).models.Invoice.list() as Promise<ListResult<Invoice>>,
    update: (input: Partial<Invoice> & { id: string }) =>
      (_client as any).models.Invoice.update(input) as Promise<ItemResult<Invoice>>,
    delete: (input: { id: string }) =>
      (_client as any).models.Invoice.delete(input) as Promise<ItemResult<Invoice>>,
  },
  Expense: {
    list: () => (_client as any).models.Expense.list() as Promise<ListResult<Expense>>,
    create: (input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) =>
      (_client as any).models.Expense.create(input) as Promise<ItemResult<Expense>>,
    delete: (input: { id: string }) =>
      (_client as any).models.Expense.delete(input) as Promise<ItemResult<Expense>>,
  },
  ActivityEvent: {
    list: () => (_client as any).models.ActivityEvent.list({ limit: 1000 }) as Promise<ListResult<ActivityEvent>>,
    create: (input: Omit<ActivityEvent, 'id' | 'createdAt' | 'updatedAt'>) =>
      (_client as any).models.ActivityEvent.create(input) as Promise<ItemResult<ActivityEvent>>,
  },
};

interface CreateInvoiceArgs {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  dueDate: string;
  sendEmail?: boolean;
  includeBusinessName?: boolean;
  includeFullName?: boolean;
  includePhone?: boolean;
  includeAddress?: boolean;
  includeAbn?: boolean;
  includePayid?: boolean;
}
interface CreateInvoiceResult {
  id: string | null;
  publicId: string | null;
  emailSent: boolean | null;
  emailError: string | null;
  error: string | null;
  errorCode: string | null;
}

interface SendEmailArgs {
  invoiceId: string;
  includeBusinessName?: boolean;
  includeFullName?: boolean;
  includePhone?: boolean;
  includeAddress?: boolean;
  includeAbn?: boolean;
  includePayid?: boolean;
}

const mutations = {
  createUserProfile: (args: { email: string; currency?: string }) =>
    (_client as any).mutations.initializeUserProfile(args) as Promise<{
      data: { id: string | null; isFoundingMember: boolean | null; subscriptionStatus: string | null; error: string | null } | null;
    }>,
  createInvoice: (args: CreateInvoiceArgs) =>
    (_client as any).mutations.issueInvoice(args) as Promise<{ data: CreateInvoiceResult | null }>,
  stripeCancelSubscription: () =>
    (_client as any).mutations.stripeCancelSubscription() as Promise<{ data: { ok: boolean | null; error: string | null } | null }>,
  sendInvoiceEmail: (args: SendEmailArgs) =>
    (_client as any).mutations.sendInvoiceEmail(args) as Promise<{ data: { ok: boolean | null; error: string | null } | null }>,
  updateEncryptedPayid: (args: { payid: string }) =>
    (_client as any).mutations.updateEncryptedPayid(args) as Promise<{ data: { ok: boolean | null; error: string | null } | null }>,
};

const queries = {
  stripeCreateCheckout: () =>
    (_client as any).queries.stripeCreateCheckout({ returnUrl: getReturnUrl() }) as Promise<{ data: { url: string | null; error: string | null } | null }>,
  stripeCreatePortal: () =>
    (_client as any).queries.stripeCreatePortal({ returnUrl: getReturnUrl() }) as Promise<{ data: { url: string | null; error: string | null } | null }>,
  exportCsv: (args: { fyStart: number }) =>
    (_client as any).queries.exportCsv(args) as Promise<{ data: { content: string | null; error: string | null } | null }>,
  getAiSummary: (args: { fyStart: number }) =>
    (_client as any).queries.getAiSummary(args) as Promise<{
      data: {
        summary: string | null; income: number | null; expenses: number | null;
        profit: number | null; unpaidCount: number | null; unpaidTotal: number | null;
        currency: string | null; error: string | null;
      } | null;
    }>,
  getDecryptedPayid: () =>
    (_client as any).queries.getDecryptedPayid() as Promise<{ data: { payid: string | null } | null }>,
};

const publicQueries = {
  getPublicInvoice: (args: { publicId: string }) =>
    (_publicClient as any).queries.getPublicInvoice(args) as Promise<{
      data: {
        clientName: string | null; clientEmail: string | null; amount: number | null;
        status: string | null; dueDate: string | null; publicId: string | null;
        businessName: string | null; payid: string | null; found: boolean | null;
      } | null;
    }>,
  getFoundingMemberStatus: () =>
    (_publicClient as any).queries.getFoundingMemberStatus() as Promise<{
      data: {
        enabled: boolean | null; claimed: number | null; limit: number | null;
        available: number | null; error: string | null;
      } | null;
    }>,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Authenticated Amplify client. Use this everywhere except public invoice. */
export const client = { models, mutations, queries };

/** Unauthenticated client for public invoice lookup. */
export const publicClient = { queries: publicQueries };

/** Fire-and-forget activity event logger. Never throws. */
export function logActivity(
  type: string,
  title: string,
  opts?: { description?: string; entityType?: string; entityId?: string }
) {
  client.models.ActivityEvent.create({ type, title, ...opts }).catch(() => {});
}
