import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy — intercepta la ruta raíz '/' cuando DISABLE_LANDING=true
 * (variable de entorno runtime, no build-time) para redirigir
 * al setup wizard o login según corresponda.
 *
 * NOTA: Next.js 16 renombró middleware.ts a proxy.ts.
 * La función exportada debe llamarse `proxy`.
 */
export async function proxy(request: NextRequest) {
  // Solo interceptar la ruta raíz
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  // Variable runtime — se lee del .env (via env_file en docker-compose)
  // En local: DISABLE_LANDING=false → la landing se muestra
  // En installer: DISABLE_LANDING=true → redirect a setup/login
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
