import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getPlatformSettings,
  updatePlatformSettings,
  PaymentGatewayMode,
} from '@/lib/contentStore';
import { resolvePayramConfig } from '@/lib/payram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const settings = getPlatformSettings();
    const cfg = resolvePayramConfig();
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://themirage.world').replace(/\/+$/, '');
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;

    if (searchParams.get('testPayram') === 'true') {
      if (!cfg.baseUrl || !cfg.apiKey) {
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
          connectionTest: {
            reachable: false,
            message: 'PayRam Base URL and API Key are required to test connection.',
          },
        });
      }

      try {
        const probeRes = await fetch(`${cfg.baseUrl}/api/v1/payment/reference/mirage_connection_test`, {
          headers: { 'API-Key': cfg.apiKey },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        const reachable = probeRes.status !== 401 && probeRes.status !== 403 && probeRes.status < 500;
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
          connectionTest: {
            reachable,
            httpStatus: probeRes.status,
            message:
              probeRes.status === 401 || probeRes.status === 403
                ? `PayRam server responded (HTTP ${probeRes.status}) — verify API Key is valid.`
                : probeRes.status < 500
                ? `Connected to ${cfg.baseUrl} cleanly (HTTP ${probeRes.status}).`
                : `PayRam server returned HTTP ${probeRes.status}.`,
          },
        });
      } catch (err: any) {
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
          connectionTest: {
            reachable: false,
            message: err?.message || `Could not reach ${cfg.baseUrl}`,
          },
        });
      }
    }

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
      { success: false, message: error?.message || 'Failed to load settings' },
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
