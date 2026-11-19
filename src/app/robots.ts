import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/register',
        '/plataforma',
        '/dashboard',
        '/productos',
        '/categorias',
        '/movimientos',
        '/clientes',
        '/ventas',
        '/usuarios',
        '/soporte',
      ],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
