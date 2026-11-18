const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://codemaxdev-sigma.vercel.app';

export const SITE_URL = new URL(siteUrl);
export const SITE_NAME = 'StockNext';
export const SITE_TITLE = 'StockNext | Gestión de inventario y ventas.';
export const SITE_DESCRIPTION =
  'Controlá tus productos, ventas y stock desde un solo lugar.';
export const SITE_LOCALE = 'es_AR';
export const SITE_LANG = 'es-AR';
export const SITE_OG_ALT =
  'StockNext: gestión de inventario y ventas para comercios';
