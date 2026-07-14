import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy — intercepts the root route '/' when DISABLE_LANDING=true
 * (runtime env variable, not build-time) to redirect
 * to the setup wizard or login as appropriate.
 *
 * NOTE: Next.js 16 renamed middleware.ts to proxy.ts.
 * The exported function must be named `proxy`.
 */
export async function proxy(request: NextRequest) {
  // Only intercept the root route
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  // Runtime variable — read from .env (via env_file in docker-compose)
  // Local: DISABLE_LANDING=false → landing is shown
  // Installer: DISABLE_LANDING=true → redirect to setup/login
  const disableLanding = process.env.DISABLE_LANDING === 'true';
  if (!disableLanding) {
    return NextResponse.next();
  }

  try {
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/setup/status`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.next();
    }

    const data = await response.json();

    if (!data.setupComplete) {
      return NextResponse.redirect(new URL('/setup', request.url));
    }

    return NextResponse.redirect(new URL('/auth', request.url));
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/',
};
