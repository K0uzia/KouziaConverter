import { invoke } from '@tauri-apps/api/core';

function toUint8Array(data: number[] | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function assertReadableFile(file: File): Promise<void> {
  if (file.size <= 0) {
    throw new Error('Fichier vide ou illisible.');
  }
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error('Impossible de lire le contenu du fichier.');
  }
}

export async function stageFileForNativeConversion(file: File, inputExt: string): Promise<string> {
  const safeExt = inputExt.trim().replace(/^\./, '') || 'bin';
  const bytes = new Uint8Array(await file.arrayBuffer());
  return invoke<string>('stage_native_input', {
    inputExt: safeExt,
    data: bytes,
  });
}

export async function readNativeOutput(outputPath: string): Promise<Uint8Array> {
  const data = await invoke<number[] | Uint8Array>('read_native_output', { outputPath });
  return toUint8Array(data);
}

export async function cleanupNativePath(filePath: string): Promise<void> {
  try {
    await invoke('remove_native_path', { filePath });
  } catch {
    // Fichier déjà supprimé ou inaccessible.
  }
}
