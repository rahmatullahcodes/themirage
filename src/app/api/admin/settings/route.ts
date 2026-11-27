import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getPlatformSettings,
  updatePlatformSettings,
  PaymentGatewayMode,
} from '@/lib/contentStore';
import { resolvePayramConfig, testPayramServerConnection } from '@/lib/payram';

export const dynamic = 'force-dynamic';

function buildPayramSummary(cfg: ReturnType<typeof resolvePayramConfig>, appBaseUrl: string) {
  return {
    active: cfg.active,
    mode: cfg.mode,
    baseUrl: cfg.baseUrl,
    webhookUrl: `${appBaseUrl}/api/webhooks/payram`,
    hasApiKey: Boolean(cfg.apiKey),
    hasWebhookSecret: Boolean(cfg.webhookSecret),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const settings = getPlatformSettings();
    const cfg = resolvePayramConfig();
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://themirage.world').replace(/\/+$/, '');
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;

    if (searchParams.get('testPayram') === 'true') {
      const connectionTest = await testPayramServerConnection(cfg.baseUrl, cfg.apiKey);
      return NextResponse.json({
        success: true,
        settings,
        payram: buildPayramSummary(cfg, appBaseUrl),
        connectionTest,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      payram: buildPayramSummary(cfg, appBaseUrl),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const cfg = resolvePayramConfig();
    const baseUrl = typeof body?.payramBaseUrl === 'string' && body.payramBaseUrl.trim()
      ? body.payramBaseUrl
      : cfg.baseUrl;
    const apiKey = typeof body?.payramApiKey === 'string' && body.payramApiKey.trim()
      ? body.payramApiKey
      : cfg.apiKey;

    const connectionTest = await testPayramServerConnection(baseUrl, apiKey);
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://themirage.world').replace(/\/+$/, '');

    return NextResponse.json({
      success: true,
      payram: buildPayramSummary(cfg, appBaseUrl),
      connectionTest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to test PayRam connection' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
      creatorCommissionPercent,
      paymentGatewayMode,
      payramBaseUrl,
      payramApiKey,
      payramWebhookSecret,
    } = body || {};

    let validatedCommission: number | undefined;
    if (creatorCommissionPercent !== undefined) {
      const val = Number(creatorCommissionPercent);
      if (!Number.isFinite(val) || val < 50 || val > 95) {
        return NextResponse.json(
          { success: false, message: 'creatorCommissionPercent must be between 50 and 95' },
          { status: 400 }
        );
      }
      validatedCommission = val;
    }

    if (
      paymentGatewayMode !== undefined &&
      paymentGatewayMode !== 'AUTO' &&
      paymentGatewayMode !== 'PAYRAM' &&
      paymentGatewayMode !== 'SANDBOX'
    ) {
      return NextResponse.json(
        { success: false, message: 'paymentGatewayMode must be AUTO, PAYRAM, or SANDBOX' },
        { status: 400 }
      );
    }

    const settings = updatePlatformSettings({
      creatorCommissionPercent: validatedCommission,
      paymentGatewayMode: paymentGatewayMode as PaymentGatewayMode | undefined,
      payramBaseUrl,
      payramApiKey,
      payramWebhookSecret,
    });

    const cfg = resolvePayramConfig();
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://themirage.world').replace(/\/+$/, '');

    return NextResponse.json({
      success: true,
      settings,
      payram: {
        active: cfg.active,
        mode: cfg.mode,
        baseUrl: cfg.baseUrl,
        webhookUrl: `${appBaseUrl}/api/webhooks/payram`,
        hasApiKey: Boolean(cfg.apiKey),
        hasWebhookSecret: Boolean(cfg.webhookSecret),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
