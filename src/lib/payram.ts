import crypto from 'crypto';
import { getPlatformSettings, PaymentGatewayMode, PendingPaymentStatus } from './contentStore';

export interface ResolvedPayramConfig {
  mode: PaymentGatewayMode;
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
  active: boolean;
}

/** Resolves effective PayRam config combining Admin UI settings with environment variables. */
export function resolvePayramConfig(): ResolvedPayramConfig {
  const settings = getPlatformSettings();
  const envMode = (process.env.PAYMENT_GATEWAY_MODE || '').toUpperCase();
  const mode: PaymentGatewayMode =
    settings.paymentGatewayMode ||
    (envMode === 'PAYRAM' || envMode === 'SANDBOX' || envMode === 'AUTO'
      ? (envMode as PaymentGatewayMode)
      : 'AUTO');

  const rawBase =
    (settings.payramBaseUrl || process.env.PAYRAM_BASE_URL || 'https://pay.themirage.world').trim();
  const baseUrl = rawBase.replace(/\/+$/, '');
  const apiKey = (settings.payramApiKey || process.env.PAYRAM_API_KEY || '').trim();
  const webhookSecret = (settings.payramWebhookSecret || process.env.PAYRAM_WEBHOOK_SECRET || '').trim();

  const active =
    mode !== 'SANDBOX' &&
    Boolean(baseUrl) &&
    Boolean(apiKey);

  return {
    mode,
    baseUrl,
    apiKey,
    webhookSecret,
    active,
  };
}

export function isPayramActive(): boolean {
  return resolvePayramConfig().active;
}

export interface PayramConnectionTestResult {
  reachable: boolean;
  httpStatus?: number;
  message: string;
}

/**
 * Probes PayRam authentication via POST /api/v1/payment with an empty body.
 * PayRam validates API-Key before payload fields (401 = bad/inactive key, 400/2xx = authenticated without creating an invoice).
 */
export async function testPayramServerConnection(
  baseUrl: string,
  apiKey: string
): Promise<PayramConnectionTestResult> {
  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const cleanKey = (apiKey || '').trim();

  if (!cleanBase || !cleanKey) {
    return {
      reachable: false,
      message: 'PayRam Base URL and API Key are required to test connection.',
    };
  }

  try {
    const probeRes = await fetch(`${cleanBase}/api/v1/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': cleanKey,
      },
      body: '{}',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const reachable = probeRes.status !== 401 && probeRes.status !== 403 && probeRes.status < 500;
    return {
      reachable,
      httpStatus: probeRes.status,
      message:
        probeRes.status === 401 || probeRes.status === 403
          ? `PayRam server responded (HTTP ${probeRes.status}) — verify API Key is valid.`
          : probeRes.status < 500
          ? `Connected to ${cleanBase} cleanly — API-Key authenticated!`
          : `PayRam server returned HTTP ${probeRes.status}.`,
    };
  } catch (err: any) {
    return {
      reachable: false,
      message: err?.message || `Could not reach ${cleanBase}`,
    };
  }
}

export interface CreatePayramPaymentResult {
  referenceId: string;
  checkoutUrl: string;
  raw: any;
}

/** Creates a crypto checkout invoice via PayRam POST /api/v1/payment. */
export async function createPayramCheckoutSession(params: {
  customerEmail: string;
  customerId: string;
  amountInUSD: number;
  invoiceId: string;
  currency?: string;
  network?: string;
}): Promise<CreatePayramPaymentResult> {
  const cfg = resolvePayramConfig();
  if (!cfg.baseUrl || !cfg.apiKey) {
    throw new Error('PayRam server URL and API-Key must be configured before creating live invoices.');
  }

  const endpoint = `${cfg.baseUrl}/api/v1/payment`;
  const payload: Record<string, string | number> = {
    customerEmail: params.customerEmail,
    customerID: params.customerId,
    amountInUSD: Number(Number(params.amountInUSD).toFixed(2)),
    invoiceID: params.invoiceId,
  };
  if (params.currency) payload.currency = params.currency;
  if (params.network) payload.network = params.network;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': cfg.apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `PayRam returned HTTP ${res.status}`);
  }

  const referenceId = String(data?.reference_id || data?.referenceID || data?.id || '');
  const checkoutUrl = String(data?.url || data?.payment_url || data?.checkout_url || '');

  if (!referenceId || !checkoutUrl) {
    throw new Error('PayRam API response is missing reference_id or checkout url.');
  }

  return {
    referenceId,
    checkoutUrl,
    raw: data,
  };
}

export interface PayramStatusCheckResult {
  ok: boolean;
  status: PendingPaymentStatus;
  currency?: string;
  network?: string;
  txHash?: string;
  raw?: any;
  error?: string;
}

export function normalizePayramStatus(rawStatus: unknown, eventName?: unknown): PendingPaymentStatus {
  const s = String(rawStatus || '').trim().toUpperCase();
  const ev = String(eventName || '').trim().toLowerCase();

  if (s === 'OVER_FILLED') return 'OVER_FILLED';
  if (s === 'FILLED' || ev === 'payment.confirmed' || ev === 'payment.filled') return 'FILLED';
  if (s === 'PARTIALLY_FILLED') return 'PARTIALLY_FILLED';
  if (s === 'EXPIRED') return 'EXPIRED';
  if (s === 'CANCELLED' || ev === 'payment.failed' || ev === 'payment.cancelled') return 'CANCELLED';
  return 'OPEN';
}

/** Polls live invoice status from self-hosted PayRam via GET /api/v1/payment/reference/:referenceId. */
export async function fetchPayramPaymentStatus(referenceId: string): Promise<PayramStatusCheckResult> {
  const cfg = resolvePayramConfig();
  if (!cfg.baseUrl || !cfg.apiKey) {
    return { ok: false, status: 'OPEN', error: 'PayRam credentials are not configured' };
  }

  try {
    const res = await fetch(
      `${cfg.baseUrl}/api/v1/payment/reference/${encodeURIComponent(referenceId)}`,
      {
        headers: {
          'API-Key': cfg.apiKey,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: 'OPEN',
        error: data?.message || data?.error || `PayRam status HTTP ${res.status}`,
      };
    }

    const status = normalizePayramStatus(data?.status || data?.paymentStatus);
    return {
      ok: true,
      status,
      currency: data?.currency || data?.token,
      network: data?.blockchain || data?.network,
      txHash: data?.txid || data?.txHash || data?.transaction_hash,
      raw: data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 'OPEN',
      error: err?.message || 'Unable to contact PayRam server',
    };
  }
}

function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies PayRam webhook authenticity via API-Key header or HMAC-SHA256 signature.
 * Strictly rejects invalid/missing auth when API-Key or Webhook Secret is configured.
 */
export function verifyPayramWebhookAuth(req: Request, rawBody: string, cfg: ResolvedPayramConfig): boolean {
  const incomingApiKey =
    (req.headers.get('api-key') || req.headers.get('x-api-key') || '').trim();
  const incomingSig = (
    req.headers.get('x-payram-signature') ||
    req.headers.get('x-signature') ||
    req.headers.get('x-webhook-signature') ||
    ''
  )
    .replace(/^sha256=/i, '')
    .trim();

  if (!cfg.apiKey && !cfg.webhookSecret) {
    return true;
  }

  if (cfg.apiKey && incomingApiKey && safeCompareStrings(incomingApiKey, cfg.apiKey)) {
    return true;
  }

  const secretKey = cfg.webhookSecret || cfg.apiKey;
  if (secretKey && incomingSig) {
    const digest = crypto.createHmac('sha256', secretKey).update(rawBody, 'utf8').digest('hex');
    if (safeCompareStrings(incomingSig.toLowerCase(), digest.toLowerCase())) {
      return true;
    }
  }

  return false;
}
