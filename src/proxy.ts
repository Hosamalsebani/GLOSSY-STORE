import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // QUICK EXIT for static assets, API, and internal Next.js routes
  // This prevents the middleware from interfering with chunk loading
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Determine locale early for route checks
  const locale = pathname.match(/^\/(en|ar)\//)?.[1] || 'en';

  // Check route types
  const isAdminRoute = pathname.startsWith(`/${locale}/admin`);
  const isAccountRoute = /^\/(en|ar)\/account(\/|$)/.test(pathname) || pathname === '/account' || pathname.startsWith('/account/');
  const isProtectedRoute = isAdminRoute || isAccountRoute;

  if (isProtectedRoute) {
    // 1. Refresh Supabase session and get user
    let supabase, user, supabaseResponse;
    try {
      const result = await updateSession(request);
      supabase = result.supabase;
      user = result.user;
      supabaseResponse = result.supabaseResponse;
    } catch (error) {
      console.error('Session update error in protected route:', error);
      // Fallback: assume not authenticated instead of crashing
      user = null;
      supabaseResponse = NextResponse.next({ request });
    }

    // 2. If not authenticated or supabase client failed, redirect to login
    if (!user || !supabase) {
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

  // For all non-protected routes, just run intl middleware.
  // Skipping updateSession here significantly improves performance for public pages (Home, Shop, Category).
  // The client-side Supabase instance in the Header will handle ephemeral session state for the UI.
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - all files with an extension (e.g. .css, .js, .png)
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    // Always run for the root
    '/',
    // Run for locale-prefixed routes, but still allow Next.js to skip assets
    '/(ar|en)/((?!_next|api|.*\\..*).*)'
  ]
};
