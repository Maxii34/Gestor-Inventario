const LOGIN_NOTICE_KEY = 'gestor.loginNotice';

type LoginNoticeListener = (mensaje: string) => void;

const loginNoticeListeners = new Set<LoginNoticeListener>();

export function onAvisoLogin(listener: LoginNoticeListener): () => void {
  loginNoticeListeners.add(listener);
  return () => {
    loginNoticeListeners.delete(listener);
  };
}

export function guardarAvisoLogin(mensaje: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LOGIN_NOTICE_KEY, mensaje);
  loginNoticeListeners.forEach((listener) => listener(mensaje));
}

export function consumirAvisoLogin(): string | null {
  if (typeof window === 'undefined') return null;
  const mensaje = window.sessionStorage.getItem(LOGIN_NOTICE_KEY);
  if (mensaje) window.sessionStorage.removeItem(LOGIN_NOTICE_KEY);
  return mensaje;
}
