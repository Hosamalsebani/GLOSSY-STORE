import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './utils/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine locale early for route checks
  const locale = pathname.match(/^\/(en|ar)\//)?.[1] || 'en';

  // Check route types
  const isAdminRoute = pathname.startsWith(`/${locale}/admin`);
  const isAccountRoute = /^\/(en|ar)\/account(\/|$)/.test(pathname) || pathname === '/account' || pathname.startsWith('/account/');
  const isProtectedRoute = isAdminRoute || isAccountRoute;

  if (isProtectedRoute) {
    // 1. Refresh Supabase session and get user
    const { supabase, user, supabaseResponse } = await updateSession(request);

    // 2. If not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Check if user is blocked
    const { data: userData } = await supabase
      .from('users')
      .select('is_blocked')
      .eq('id', user.id)
      .single();

    if (userData?.is_blocked) {
      const blockedUrl = new URL(`/${locale}/login`, request.url);
      blockedUrl.searchParams.set('error', 'blocked');
      return NextResponse.redirect(blockedUrl);
    }

    // 4. For admin routes, check admin status
    if (isAdminRoute) {
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single();

      if (!adminRecord) {
        const homeUrl = new URL(`/${locale}`, request.url);
        homeUrl.searchParams.set('denied', 'true');
        return NextResponse.redirect(homeUrl);
      }
    }

    // 4. User is authorized — run intl middleware and copy auth cookies
    const intlResponse = intlMiddleware(request);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, { ...cookie });
    });
    return intlResponse;
  }

  // For all non-protected routes, just run intl middleware + session refresh
  const { supabaseResponse } = await updateSession(request);
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, { ...cookie });
  });
  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
    '/(ar|en)/:path*'
  ]
};
