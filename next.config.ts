import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Turbopack infer
  // the wrong workspace root. Pin it to this project.
  turbopack: { root: __dirname },

  // Our only root layout lives under a dynamic segment (app/[locale]), which
  // Next names as the case where a 404 cannot be composed from layout +
  // not-found. app/global-not-found.tsx handles unmatched URLs instead.
  // The older workaround — a [...rest] catch-all calling notFound() — was
  // matching ahead of its static siblings and 404'd every subpage.
  experimental: { globalNotFound: true },

  // Redirect map from old-site URLs (brief §10). The middleware already
  // localizes bare paths like /about; entries here cover legacy slugs that
  // differ from the new sitemap. Extend once the client supplies the full
  // list of indexed old URLs.
  async redirects() {
    return [
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/subsidiaries", destination: "/peng-edition", permanent: true },
      {
        source: "/subsidiaries/:path*",
        destination: "/peng-edition",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
