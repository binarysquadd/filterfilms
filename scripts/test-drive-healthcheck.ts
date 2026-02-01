import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), 'env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function normalizeHealthUrl(input: string): string {
  const url = input.trim();

  if (url.includes('/api/health/drive')) {
    return url;
  }

  if (url.endsWith('/health/drive')) {
    return url.replace(/\/health\/drive$/, '/api/health/drive');
  }

  if (url.endsWith('/')) {
    return `${url}api/health/drive`;
  }

  return `${url}/api/health/drive`;
}

async function main() {
  const rawUrl =
    process.env.DRIVE_HEALTHCHECK_URL ||
    (() => {
      const target = process.env.DRIVE_HEALTHCHECK_TARGET?.toLowerCase();
      const urls = {
        prod: process.env.DRIVE_HEALTHCHECK_URL_PROD,
        remote: process.env.DRIVE_HEALTHCHECK_URL_REMOTE,
        local: process.env.DRIVE_HEALTHCHECK_URL_LOCAL,
      } as const;

      const defined = Object.entries(urls).filter(([, value]) => Boolean(value));

      if (target && urls[target as keyof typeof urls]) {
        return urls[target as keyof typeof urls] as string;
      }

      if (defined.length > 1) {
        throw new Error(
          `Multiple DRIVE_HEALTHCHECK_URL_* values are set. Set DRIVE_HEALTHCHECK_TARGET (prod|remote|local) or leave only one URL.`
        );
      }

      return defined[0]?.[1] ?? 'http://localhost:3002/api/health/drive';
    })();
  const url = normalizeHealthUrl(rawUrl);
  const discordWebhook = process.env.DRIVE_DISCORD_WEBHOOK_URL;
  const label = process.env.DRIVE_HEALTHCHECK_LABEL?.trim();

  let derivedLabel = label;
  if (!derivedLabel) {
    if (url.includes('filterfilms.in')) {
      derivedLabel = 'Prod';
    } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
      derivedLabel = 'Local';
    } else {
      derivedLabel = 'Remote';
    }
  }

  const secret =
    (derivedLabel === 'Prod' ? process.env.HEALTHCHECK_SECRET_PROD : undefined) ||
    (derivedLabel === 'Remote' ? process.env.HEALTHCHECK_SECRET_REMOTE : undefined) ||
    (derivedLabel === 'Local' ? process.env.HEALTHCHECK_SECRET_LOCAL : undefined) ||
    process.env.HEALTHCHECK_SECRET;

  if (!discordWebhook) {
    throw new Error('Missing DRIVE_DISCORD_WEBHOOK_URL');
  }

  let target = url;
  if (secret) {
    target += target.includes('?') ? `&token=${secret}` : `?token=${secret}`;
  }

  const headers = secret ? { 'x-healthcheck-secret': secret } : undefined;
  console.log(`➡️  Checking: ${target}`);
  const res = await fetch(target, { headers });
  const contentType = res.headers.get('content-type') ?? '';
  const bodyText = await res.text();

  let responseSummary = bodyText;
  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed?.tokenActive === true) {
        responseSummary = 'Token ACTIVE';
      } else if (parsed?.error?.message === 'Unauthorized') {
        responseSummary = 'Unauthorized (check HEALTHCHECK_SECRET on server)';
      } else if (parsed?.tokenActive === false) {
        responseSummary = 'Token INACTIVE';
      } else if (parsed?.ok === false) {
        responseSummary = 'Check failed (see server logs)';
      } else {
        responseSummary = 'Unknown response';
      }
    } catch {
      responseSummary = bodyText;
    }
  } else if (contentType.includes('text/html')) {
    responseSummary = 'Non-JSON response (check URL/port)';
  }

  const state = res.ok ? 'ACTIVE' : 'FAILED';
  const hint =
    res.status === 404
      ? 'Hint: check DRIVE_HEALTHCHECK_URL (port) and ensure /api/health/drive exists.'
      : undefined;

  const color = res.ok ? 0x22c55e : 0xef4444;
  const payload = {
    embeds: [
      {
        title: derivedLabel ? `Drive Token Status (${derivedLabel})` : 'Drive Token Status',
        description: state,
        color,
        fields: [
          { name: 'Status', value: String(res.status), inline: true },
          { name: 'Token', value: responseSummary, inline: true },
          ...(hint ? [{ name: 'Hint', value: hint, inline: false }] : []),
        ],
      },
    ],
  };

  const webhookRes = await fetch(discordWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!webhookRes.ok) {
    throw new Error(`Discord webhook failed: ${webhookRes.status}`);
  }

  console.log(`✅ Discord notification sent (${state}, ${res.status})`);
}

main().catch((err) => {
  console.error('❌ test-drive-healthcheck failed', err);
  process.exit(1);
});
