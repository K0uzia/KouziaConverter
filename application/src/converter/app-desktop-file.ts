import { invoke } from '@tauri-apps/api/core';

const DESKTOP_FILE_PATH = Symbol.for('cal.desktopFilePath');

interface LocalFileMeta {
  path: string;
  name: string;
  mime: string;
  size: number;
}

interface LocalFilePayload {
  name: string;
  mime: string;
  size: number;
  data: number[] | Uint8Array;
}

export function attachDesktopFilePath(file: File, path: string): File {
  Object.defineProperty(file, DESKTOP_FILE_PATH, {
    value: path,
    enumerable: false,
    writable: false,
  });
  return file;
}

export function getDesktopFilePath(file: File): string | undefined {
  const path = (file as File & { [key: symbol]: unknown })[DESKTOP_FILE_PATH];
  return typeof path === 'string' && path.length > 0 ? path : undefined;
}

/** Fichier léger (métadonnées seulement) pour la file d'attente desktop. */
export function createDesktopFileStub(meta: LocalFileMeta): File {
  const file = new File([], meta.name, {
    type: meta.mime || 'application/octet-stream',
    lastModified: Date.now(),
  });
  Object.defineProperty(file, 'size', {
    value: meta.size,
    configurable: true,
  });
  return attachDesktopFilePath(file, meta.path);
}

export async function statDesktopPaths(paths: readonly string[]): Promise<LocalFileMeta[]> {
  return invoke<LocalFileMeta[]>('stat_local_paths', { paths: [...paths] });
}

function payloadToFile(payload: LocalFilePayload, sourcePath?: string): File {
  const bytes = payload.data instanceof Uint8Array ? payload.data : new Uint8Array(payload.data);
  const file = new File([bytes], payload.name, {
    type: payload.mime || 'application/octet-stream',
    lastModified: Date.now(),
  });
  if (sourcePath) attachDesktopFilePath(file, sourcePath);
  return file;
}

/** Charge le contenu depuis le disque uniquement au moment de la conversion WASM. */
export async function materializeDesktopFile(file: File, sourcePath?: string): Promise<File> {
  const path = sourcePath ?? getDesktopFilePath(file);
  if (!path) return file;
  if (file.size > 0) {
    try {
      const sample = await file.slice(0, 1).arrayBuffer();
      if (sample.byteLength > 0) return file;
    } catch {
      // Fichier stub : lecture disque ci-dessous.
    }
  }
  const [payload] = await invoke<LocalFilePayload[]>('read_local_paths', { paths: [path] });
  if (!payload) {
    throw new Error('Impossible de lire le fichier sur le disque.');
  }
  return payloadToFile(payload, path);
}
