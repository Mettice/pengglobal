import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale negotiation and prefixing, from next-intl.
 *
 * Named `proxy` rather than `middleware`: Next deprecated the middleware
 * file convention in favour of proxy. The file is what Next reads, and a
 * default-exported function satisfies it — next-intl still ships this
 * factory under its middleware entry point, which is why the import path
 * keeps the old name.
 */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next internals, and static files.
  // Without a matcher, proxy runs on every request including /public assets.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
