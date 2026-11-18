# 📦 StockNext — Frontend

Panel administrativo web para la gestión de inventario, ventas, clientes y usuarios. Incluye dashboard con métricas, control de stock, ventas presenciales con medios de pago directos (efectivo, transferencia y tarjeta), y autenticación con roles.

> Frontend en **Next.js (App Router)** que consume el backend REST del proyecto. No expone secretos: solo usa la URL pública del API.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-13-FF0080?logo=framer&logoColor=white)](https://motion.dev/)
[![React Icons](https://img.shields.io/badge/React_Icons-5-E91E63?logo=react&logoColor=white)](https://react-icons.github.io/react-icons/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-Privado-lightgrey)](#-licencia)

---

## ✨ Descripción

**StockNext** es una aplicación full-stack para pequeños y medianos negocios:

- Control de **productos, categorías y stock** (con mínimo y alertas de stock bajo / crítico).
- Registro de **movimientos de stock** (entradas, salidas, ajustes).
- Gestión de **clientes** y **ventas**.
- **Ventas directas**: registro inmediato con medios de pago efectivo, transferencia o tarjeta.
- **Usuarios y roles** (ej. admin / vendedor) con rutas protegidas.
- **Dashboard** con resumen (totales, ventas recientes, stock bajo) y acciones rápidas.
- UI responsive: sidebar fijo en desktop, drawer en móvil, skeletons de carga, animaciones con Motion y tablas con paginación.

Rutas principales:

| Ruta | Módulo |
|------|--------|
| `/login` | Inicio de sesión |
| `/dashboard` | Resumen general del negocio |
| `/productos` | Alta, edición y control de stock |
| `/categorias` | Organización del catálogo |
| `/movimientos` | Entradas / salidas / ajustes de stock |
| `/clientes` | Gestión de clientes |
| `/ventas` | Ventas presenciales y anulación con motivo |
| `/usuarios` | Administración de usuarios y roles |

---

## 🧩 Funcionalidades destacadas

- 🔐 **Auth con JWT + refresh**: contexto `AuthContext`, guard `RequireAuth`, control por rol (`hasRole`), cierre de sesión y manejo de sesión expirada.
- 📊 **Dashboard en vivo**: tarjetas de Productos / Stock bajo / Ventas / Clientes, tablas de ventas recientes y stock bajo.
- 🛒 **Ventas directas**: alta con stock, cliente opcional y medios de pago efectivo, transferencia o tarjeta; anulación con motivo y reposición de stock.
- 📦 **Stock inteligente**: badges Crítico / Bajo, validaciones y movimientos auditables.
- 🧱 **UI propia reutilizable**: `Button`, `Input`, `Select`, `Modal`, `Card`, `Badge`, `Table`, `Pagination`, `PageHeader`, `EmptyState`, `SearchInput`, `FormField`, `Reveal`.
- 📱 **Responsive + accesible**: drawer móvil, `aria-*`, skeletons, `prefers-reduced-motion`.
- 🔌 **Cliente API centralizado**: `lib/api/client` + servicios por dominio (`auth`, `productos`, `categorias`, `clientes`, `ventas`, `movimientos`, `dashboard`, `estadisticas`, `usuarios`).

---

## 🛠️ Tecnologías

| Área | Tecnología |
|------|------------|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white) App Router |
| Librería UI | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) + React DOM |
| Lenguaje | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| Estilos | ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white) + PostCSS |
| Animaciones | ![Motion](https://img.shields.io/badge/Motion-13-FF0080) (`motion/react`) |
| Iconos | ![Icons](https://img.shields.io/badge/react--icons-Lu-red) Lucide (`react-icons/lu`) |
| Calidad | ESLint + `eslint-config-next` |
| Deploy | ![Vercel](https://img.shields.io/badge/Vercel-deploy-black?logo=vercel) |

**Estructura:**

```text
src/
├── app/            # Rutas App Router ((app), dashboard, productos, ventas, login)
├── components/     # ui, layout, tables, forms, motion, auth, estadisticas
├── context/        # AuthContext
├── lib/api/        # cliente fetch + manejo ApiError
├── lib/auth/       # storage de tokens / usuario
├── services/       # llamadas al backend por dominio
└── types/          # tipos TS por dominio
```

---

## 🔗 Backend y Deploy

Este frontend **no funciona solo**: necesita el backend REST.

| Recurso | Link |
|---------|------|
| 🌐 **Frontend en producción (este proyecto)** | [https://codemaxdev-sigma.vercel.app](https://codemaxdev-sigma.vercel.app) |
| 🚀 **Backend en producción (deploy)** | [https://gestor-inventario-back.vercel.app](https://gestor-inventario-back.vercel.app) |
| 💻 **GitHub del backend** | [Maxii34/Gestor-Inventario-back](https://github.com/Maxii34/Gestor-Inventario-back) |

> El backend expone sus rutas en la raíz, **sin prefijo `/api`**. El frontend solo configura la URL base pública vía `NEXT_PUBLIC_API_URL`.

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+

### 1. Clonar e instalar

```bash
git clone <URL-DE-ESTE-FRONTEND>
cd gestor-front
npm install
```

### 2. Variables de entorno

Copia la plantilla y completá las variables públicas:

```bash
cp .env.example .env.local
```

| Variable | Para qué se usa | Ejemplo local |
|----------|-----------------|---------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend REST (sin `/api`) | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend para canonical, Open Graph, sitemap y enlaces legales | `http://localhost:3000` |

Contenido de `.env.local` para desarrollo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

En producción (`.env.production` o variables de Vercel):

```env
NEXT_PUBLIC_API_URL=https://gestor-inventario-back.vercel.app
NEXT_PUBLIC_APP_URL=https://codemaxdev-sigma.vercel.app
```

> 🔒 Solo se usan variables `NEXT_PUBLIC_*` públicas. No guardes tokens, claves ni contraseñas en el repo ni en `.env.local`.

### 3. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la landing pública. El acceso de los comercios está en `/login`.

### 4. Producción

```bash
npm run build
npm run start
```

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | Linter (ESLint) |

---

## Capturas, textos y SEO

### Capturas

Guardá las imágenes en `public/img/`. Los nombres actuales ya están conectados en `src/content/site.ts`:

| Archivo | Uso | Medida actual |
|---------|-----|----------------|
| `home.png` | Hero de escritorio | 1352 × 767 px |
| `homecelu.png` | Hero de celular | 322 × 573 px |
| `cargaproductoxunidad.png` | Productos por unidad | 1365 × 766 px |
| `nuevaventa.png` | Nueva venta | 1365 × 767 px |
| `cargaxcaja24.png` | Costo por caja de 24 | 1365 × 767 px |
| `cargaconbarra.png` | Carga con código de barras | 1365 × 767 px |
| `registrostock.png` | Registro de stock | 1365 × 767 px |
| `personalstatus.png` | Ventas por vendedor | 1365 × 767 px |
| `equipoyroles.png` | Equipo y roles | 1365 × 767 px |

- Las capturas de escritorio se muestran en 16:9 y la de celular en 9:16. Si reemplazás una imagen, mantené esa proporción.
- Hacé clic sobre una captura para verla en grande; `Escape` o el botón de cerrar cierran la vista ampliada.
- Evitá datos reales o sensibles en las imágenes.
- Si falta una captura, la landing muestra el recuadro "Captura no disponible".

### Textos y precios

Todo el contenido de la landing está en `src/content/site.ts`:

- `heroe`, `funcionesSeccion`, `funcionesResumen`, `funcionesDetalle`, `beneficios`, `comoEmpezar`, `paraQuien`, `limitaciones`, `preguntasFrecuentes` y `pie`.
- `planes` define precio, meses, textos y plan destacado. `calcularAhorro` recalcula el ahorro y el equivalente mensual; no hardcodees esos valores en `page.tsx`.
- `contacto` y `mensajesWhatsapp` concentran el email y los mensajes de WhatsApp.
- Los metadatos y la URL pública se editan en `src/lib/seo.ts`.

### SEO

- `src/lib/seo.ts`: nombre, título, descripción, locale y URL del sitio (`NEXT_PUBLIC_APP_URL`).
- `src/app/opengraph-image.tsx`: imagen de 1200 × 630 generada con `next/og`.
- `src/app/sitemap.ts` y `src/app/robots.ts`: sitemap público y exclusión de rutas privadas.
- `src/app/icon.svg`: favicon e icono de la aplicación.
- El JSON-LD de `SoftwareApplication` está en `src/app/page.tsx`, sin valoraciones ni reseñas.

---

## 👤 Autor

**Maxi Ordoñez** — Desarrollo y diseño del frontend (panel administrativo, dashboard, ventas directas, auth con roles, UI reutilizable).

- 📧 `exemaxi@outlook.com`
- 💼 Frontend: Next.js + React + TypeScript + Tailwind

> ¿Quieres colaborar? Abre un issue o PR en el repo del frontend.

---

## 🛡️ Notas de seguridad

- No se commitean `.env.local` ni credenciales (revisar `.gitignore`).
- Los tokens se manejan en cliente vía `lib/auth/storage` + refresh; nunca se hardcodean.

---

## 📄 Licencia

Proyecto privado / de uso interno. Todos los derechos reservados por el autor. Si quieres reutilizarlo, pide autorización.

---

💡 *Hecho con Next.js, React y Tailwind — optimizado para Vercel.*
