import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - all files with an extension (e.g. /favicon.ico, /images/logo.png)
  matcher: ['/((?!api|_next|_static|_vercel|.*\\..*).*)']
};
