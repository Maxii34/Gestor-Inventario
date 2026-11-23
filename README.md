# 📦 StockNext — SaaS de gestión para comercios

**StockNext** es un SaaS multi-comercio para gestionar inventario, ventas, stock, equipo y suscripciones desde el navegador. Cada comercio trabaja en un espacio aislado, con sus propios usuarios, productos, movimientos y estadísticas.

> Frontend en **Next.js (App Router)** que consume el backend REST. No expone secretos.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-13-FF0080?logo=framer&logoColor=white)](https://motion.dev/)
[![React Icons](https://img.shields.io/badge/React_Icons-5-E91E63?logo=react&logoColor=white)](https://react-icons.github.io/react-icons/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-Privado-lightgrey)](#-licencia)

---

## ✨ Descripción

- **SaaS multi-comercio**: datos separados por comercio y acceso independiente.
- **Prueba de 14 días** sin tarjeta, con planes mensual y trimestral.
- **Pago por transferencia**, sin renovación automática ni permanencia.
- **3 días de gracia** al vencer; luego el acceso pasa a modo solo lectura.
- El alta de comercios la realiza el superadministrador desde una **ruta especial de administración de plataforma** (uso interno del autor).

Rutas de los comercios:

| Ruta | Módulo |
|------|--------|
| `/login` | Ingreso con identificador del comercio, email y contraseña |
| `/dashboard` | Recaudación, indicadores, ventas recientes y stock bajo |
| `/productos` | Catálogo, precios, costo por caja, código de barras y stock mínimo |
| `/categorias` | Organización del catálogo |
| `/movimientos` | Entradas, salidas y ajustes con historial auditable |
| `/ventas` | Recaudación, historial, filtros y anulación |
| `/ventas/nueva` | Venta de mostrador con escaneo y medios de pago |
| `/usuarios` | Equipo, roles y ventas por vendedor |
| `/soporte` | Ayuda, preguntas frecuentes, suscripción, pagos y contacto |

---

## 🧩 Funcionalidades

- 🔐 **Auth con JWT + refresh**: login por `slug` + email + contraseña, sesión expirada, cuenta suspendida y cambio obligatorio de contraseña.
- 👥 **Roles**: administrador y vendedor, con rutas y acciones protegidas.
- 📊 **Dashboard**: recaudación por período, ventas, productos, ventas recientes, stock bajo y accesos rápidos.
- 📦 **Productos y categorías**: costo por unidad o por caja (cálculo automático), código de barras, stock mínimo, búsqueda, filtros y paginación.
- 🔄 **Control de stock**: entradas, salidas y ajustes con motivo, proveedor, responsable y fecha; historial filtrable y reposición rápida.
- 🛒 **Ventas**: escaneo con lector USB/Bluetooth o cámara, sincronización de stock, medios de pago efectivo/transferencia/tarjeta y anulación con motivo + reposición de stock.
- 📈 **Estadísticas**: recaudación por rango de fechas y ventas por vendedor (cantidad, total, ticket promedio, anuladas y última venta).
- ⏱️ **Actualización automática**: las pantallas se refrescan cada 20–30 segundos; si no hay actividad, baja la frecuencia.
- 💳 **Suscripción integrada**: estado del plan, vencimiento, días restantes, avisos en pantalla, renovación por transferencia y modo solo lectura.
- 💬 **Centro de ayuda**: preguntas frecuentes, datos de pago, reporte de problemas con diagnóstico automático y sugerencias.
- 🏢 **Administración de plataforma** (ruta especial del autor): métricas, alta/suspensión/reactivación de comercios, extensión de accesos, cambios de plan, registro de pagos, auditoría, gestión de usuarios y cargas masivas de categorías/productos con simulación.
- 🧱 **UI propia**: `Button`, `Input`, `Select`, `Modal`, `Card`, `Badge`, `Table`, `Pagination`, `PageHeader`, `EmptyState`, `SearchInput`, `FormField`, `Reveal`.
- 📱 **Responsive y accesible**: sidebar colapsable, drawer móvil, skeletons, `aria-*`, `prefers-reduced-motion` y avisos con SweetAlert2.

---

## 🛠️ Tecnologías

| Área | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Estilos | Tailwind CSS 4 + PostCSS |
| Animaciones | Motion 13 (`motion/react`) |
| Iconos | React Icons (Lucide) |
| Escaneo | `barcode-detector` + cámara del dispositivo |
| Avisos | SweetAlert2 |
| Calidad | ESLint + `eslint-config-next` |

**Estructura:**

```text
src/
├── app/            # Landing, login, panel del comercio y ruta especial de plataforma
├── components/     # ui, layout, tables, forms, motion, auth, estadísticas, ventas
├── content/        # Textos, precios y capturas de la landing
├── context/        # Auth, Suscripción y Alertas de stock
├── hooks/          # Auto-refresh y soporte de cámara
├── lib/            # API, auth, SEO, suscripción y utilidades
├── services/       # Llamadas al backend por dominio
└── types/          # Tipos TS por dominio
```

---

## Capturas, textos y SEO

### Capturas

Las imágenes están en `public/img/` y conectadas desde `src/content/site.ts`:

`home.png`, `homecelu.png`, `cargaproductoxunidad.png`, `nuevaventa.png`, `cargaxcaja24.png`, `cargaconbarra.png`, `registrostock.png`, `personalstatus.png`, `equipoyroles.png`.

- Escritorio en proporción 16:9 y celular en 9:16.
- Clic para ampliar; `Escape` cierra la vista.
- Si falta una imagen, se muestra “Captura no disponible”.

### Contenido

Todo el texto de la landing está en `src/content/site.ts`: hero, funciones, beneficios, cómo empezar, para quién, limitaciones, planes, preguntas frecuentes, CTA y pie. Los precios y el ahorro se calculan desde `planes` y `calcularAhorro`.

### SEO

- `src/lib/seo.ts`: nombre, título, descripción, locale y URL pública.
- `src/app/opengraph-image.tsx`: imagen 1200 × 630 con `next/og`.
- `src/app/sitemap.ts` y `src/app/robots.ts`: sitemap público y exclusión de rutas privadas.
- `src/app/icon.svg`: favicon.
- JSON-LD de `SoftwareApplication` en `src/app/page.tsx`.
- El panel del comercio y la ruta especial de administración no se indexan.

---

## 👤 Autor y soporte

**Maxi Ordoñez** — desarrollo y diseño del frontend.

- 📧 `stocknext.dev@gmail.com`
- 📱 WhatsApp: +54 381 6870337
- 💼 Next.js + React + TypeScript + Tailwind

---

## 🛡️ Seguridad

- No se commitean credenciales ni secretos.
- Tokens en cliente con refresh; nunca hardcodeados.
- Datos aislados por comercio y accesos por rol.
- Al vencer la suscripción, el sistema pasa a solo lectura.

---

## 📄 Licencia

Proyecto privado / de uso interno. Todos los derechos reservados por el autor. Si querés reutilizarlo, pedí autorización.

---

💡 *Hecho con Next.js, React y Tailwind.*
