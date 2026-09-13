# 📦 Gestor de Inventario — Frontend

Panel administrativo web para la gestión de inventario, ventas, clientes y usuarios. Incluye dashboard con métricas, control de stock, ventas presenciales y a distancia con pago por link / QR, y autenticación con roles.

> Frontend en **Next.js (App Router)** que consume el backend REST del proyecto. No expone secretos: solo usa la URL pública del API.

> 🚀 **Demo en vivo:** <!-- TODO: reemplazar cuando se despliegue --> [https://gestor-front-TU-USUARIO.vercel.app](https://gestor-front-TU-USUARIO.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-13-FF0080?logo=framer&logoColor=white)](https://motion.dev/)
[![React Icons](https://img.shields.io/badge/React_Icons-5-E91E63?logo=react&logoColor=white)](https://react-icons.github.io/react-icons/)
[![QRCode](https://img.shields.io/badge/QRCode.react-4-000000?logo=qr&logoColor=white)](https://www.npmjs.com/package/qrcode.react)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-Privado-lightgrey)](#-licencia)

---

## ✨ Descripción

**Gestor de Inventario** es una aplicación full-stack para pequeños y medianos negocios:

- Control de **productos, categorías y stock** (con mínimo y alertas de stock bajo / crítico).
- Registro de **movimientos de stock** (entradas, salidas, ajustes).
- Gestión de **clientes** y **ventas**.
- **Ventas a distancia**: genera un link de pago + código QR, con polling automático del estado y botón para compartir por WhatsApp.
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
| `/ventas` | Ventas presenciales + a distancia (QR) |
| `/pagos/exitoso`, `/pagos/fallido`, `/pagos/pendiente` | Retorno del flujo de pago |
| `/usuarios` | Administración de usuarios y roles |

---

## 🧩 Funcionalidades destacadas

- 🔐 **Auth con JWT + refresh**: contexto `AuthContext`, guard `RequireAuth`, control por rol (`hasRole`), cierre de sesión y manejo de sesión expirada.
- 📊 **Dashboard en vivo**: tarjetas de Productos / Stock bajo / Ventas / Clientes, tablas de ventas recientes y stock bajo.
- 🛒 **Ventas flexibles**: venta presencial y venta a distancia con `PagoDistanciaModal` (link + `QRCodeSVG` + polling cada 5s + copiar link + compartir por WhatsApp).
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
| QR | `qrcode.react` (`QRCodeSVG`) |
| Calidad | ESLint + `eslint-config-next` |
| Deploy | ![Vercel](https://img.shields.io/badge/Vercel-deploy-black?logo=vercel) |

**Estructura:**

```text
src/
├── app/            # Rutas App Router ((app), dashboard, productos, ventas, pagos, login)
├── components/     # ui, layout, tables, forms, motion, auth, ventas, estadisticas
├── context/        # AuthContext
├── lib/api/        # cliente fetch + manejo ApiError
├── lib/auth/       # storage de tokens / usuario
├── services/       # llamadas al backend por dominio
├── types/          # tipos TS por dominio
└── mocks/          # mocks (ej. pagos)
```

---

## 🔗 Backend y Deploy

Este frontend **no funciona solo**: necesita el backend REST.

| Recurso | Link |
|---------|------|
| 🌐 **Frontend en producción (este proyecto)** | <!-- TODO: reemplazar cuando se despliegue --> [[[https://gestor-front-TU-USUARIO.vercel.app](https://sistema-inventario-woad.vercel.app/login)](https://sistema-inventario-woad.vercel.app/login)](https://gestor-front-TU-USUARIO.vercel.app) |
| 🚀 **Backend en producción (deploy)** | [https://gestor-inventario-back.vercel.app](https://gestor-inventario-back.vercel.app) |
| 💻 **GitHub del backend** | <!-- TODO: reemplazar con la URL real --> `https://github.com/Maxii34/Gestor-Inventario-back` |

> El backend expone sus rutas en la raíz, **sin prefijo `/api`**. El frontend solo configura la URL base pública vía `NEXT_PUBLIC_API_URL`.

Si ya tienes la URL del repo del backend, reemplaza el placeholder de arriba.

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

Copia la plantilla (no contiene secretos):

```bash
# Desarrollo
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Producción
# NEXT_PUBLIC_API_URL=https://gestor-inventario-back.vercel.app
```

Crea tu archivo local:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Para producción (` .env.production` + variable en Vercel):

```env
NEXT_PUBLIC_API_URL=https://gestor-inventario-back.vercel.app
```

> 🔒 Solo se usa `NEXT_PUBLIC_*` (URL base pública). No se guardan tokens, claves ni contraseñas en el repo.

### 3. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → redirige a `/dashboard` (requiere login).

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

## 👤 Autor

**Maxi Ordoñez** — Desarrollo y diseño del frontend (panel administrativo, dashboard, ventas con QR, auth con roles, UI reutilizable).

- 📧 `exemaxi@outlook.com`
- 💼 Frontend: Next.js + React + TypeScript + Tailwind

> ¿Quieres colaborar? Abre un issue o PR en el repo del frontend.

---

## 🛡️ Notas de seguridad

- No se commitean `.env.local` ni credenciales (revisar `.gitignore`).
- Los tokens se manejan en cliente vía `lib/auth/storage` + refresh; nunca se hardcodean.
- Los links de pago son generados por el backend; el frontend solo los muestra (texto + QR) y consulta el estado.

---

## 📄 Licencia

Proyecto privado / de uso interno. Todos los derechos reservados por el autor. Si quieres reutilizarlo, pide autorización.

---

💡 *Hecho con Next.js, React y Tailwind — optimizado para Vercel.*
