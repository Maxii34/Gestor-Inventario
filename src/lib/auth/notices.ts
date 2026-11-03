const LOGIN_NOTICE_KEY = 'gestor.loginNotice';

type LoginNoticeListener = () => void;

const loginNoticeListeners = new Set<LoginNoticeListener>();
let avisoActual: string | null | undefined;

export function onAvisoLogin(listener: LoginNoticeListener): () => void {
  loginNoticeListeners.add(listener);
  return () => {
    loginNoticeListeners.delete(listener);
  };
}

export function getAvisoLoginSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  if (avisoActual === undefined) {
    avisoActual = window.sessionStorage.getItem(LOGIN_NOTICE_KEY);
  }
  return avisoActual;
}

function notificarAvisoLogin(): void {
  loginNoticeListeners.forEach((listener) => listener());
}

export function guardarAvisoLogin(mensaje: string): void {
  if (typeof window === 'undefined') return;
  avisoActual = mensaje;
  window.sessionStorage.setItem(LOGIN_NOTICE_KEY, mensaje);
  notificarAvisoLogin();
}

export function limpiarAvisoLogin(): void {
  if (typeof window === 'undefined') return;
  avisoActual = null;
  window.sessionStorage.removeItem(LOGIN_NOTICE_KEY);
  notificarAvisoLogin();
}
