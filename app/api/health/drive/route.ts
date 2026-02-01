import { driveService } from '@/app/lib/google-drive.server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.HEALTHCHECK_SECRET;
  const token = url.searchParams.get('token') ?? req.headers.get('x-healthcheck-secret');

  const isDev = process.env.NODE_ENV !== 'production';

  if (secret && token !== secret && !isDev) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Unauthorized',
          details: {
            secretSet: true,
            tokenProvided: Boolean(token),
            tokenLength: token?.length ?? 0,
            secretLength: secret.length,
          },
        },
      },
      { status: 401 }
    );
  }

  const result = await driveService.healthCheck();

  return NextResponse.json(
    {
      ok: result.ok,
      tokenActive: result.ok,
      checkedAt: new Date().toISOString(),
    },
    { status: result.ok ? 200 : 503 }
  );
}
