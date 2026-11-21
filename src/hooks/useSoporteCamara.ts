'use client';

import { useSyncExternalStore } from 'react';

const suscribir = () => () => {};

function obtenerSnapshot(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      window.isSecureContext &&
      navigator.mediaDevices?.getUserMedia,
  );
}

function obtenerSnapshotServidor(): boolean {
  return false;
}

export function useSoporteCamara(): boolean {
  return useSyncExternalStore(suscribir, obtenerSnapshot, obtenerSnapshotServidor);
}
