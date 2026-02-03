import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/app/lib/middleware';

function makeRequest(url: string, cookie?: string) {
  const req = new NextRequest(new Request(url));
  if (cookie) {
    req.cookies.set('firebase-session', cookie);
  }
  return req;
}

describe('middleware', () => {
  it('allows public routes', async () => {
    const res = await middleware(makeRequest('https://example.com/signin'));
    expect(res).toBeDefined();
    expect(res?.headers.get('location')).toBeNull();
  });

  it('redirects to /signin when no session cookie', async () => {
    const res = await middleware(makeRequest('https://example.com/admin'));
    expect(res?.headers.get('location')).toBe('https://example.com/signin');
  });

  it('allows protected routes when session cookie present', async () => {
    const res = await middleware(makeRequest('https://example.com/admin', 'token'));
    expect(res?.headers.get('location')).toBeNull();
  });
});
