import { writable, derived } from 'svelte/store';
import type { OutputFormatId, QueuedFile } from '@convertalllocal/core';

function inferKind(file: File): QueuedFile['kind'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'ico' || ext === 'icns') return 'icon';
  return 'unknown';
}

function createId(): string {
  return crypto.randomUUID();
}

function createQueuedFile(file: File): QueuedFile {
  return {
    id: createId(),
    file,
    name: file.name,
    size: file.size,
    kind: inferKind(file),
    status: 'ready',
  };
}

export const files = writable<QueuedFile[]>([]);
export const selectedPresetId = writable<string>('webp-80');
export const selectedFormatId = writable<OutputFormatId>('webp');
export const toastMessage = writable<string | null>(null);

export const fileCount = derived(files, ($files) => $files.length);

export function addFiles(newFiles: FileList | File[]): void {
  const list = Array.from(newFiles);
  files.update((current) => [...current, ...list.map(createQueuedFile)]);
}

export function removeFile(id: string): void {
  files.update((current) => current.filter((f) => f.id !== id));
}

export function clearFiles(): void {
  files.set([]);
}

export function showToast(message: string, durationMs = 4000): void {
  toastMessage.set(message);
  setTimeout(() => {
    toastMessage.update((m) => (m === message ? null : m));
  }, durationMs);
}
