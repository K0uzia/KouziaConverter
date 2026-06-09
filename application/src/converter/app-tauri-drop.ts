import { getCurrentWebview } from '@tauri-apps/api/webview';
import { createDesktopFileStub, statDesktopPaths } from './app-desktop-file.ts';

type FileEnqueueHandler = (files: FileList | File[]) => void;

let listenerBound = false;

function showDropAlert(message: string): void {
  const alertEl = document.querySelector<HTMLElement>('[data-converter-dropzone-alert]');
  const dropzone = document.querySelector<HTMLElement>('[data-converter-dropzone]');
  if (!alertEl) return;
  alertEl.hidden = false;
  alertEl.textContent = message;
  dropzone?.classList.add('converter__dropzone--reject');
}

async function bindTauriDropListener(
  addFiles: FileEnqueueHandler,
  dropzone: HTMLElement,
): Promise<void> {
  const webview = getCurrentWebview();
  await webview.onDragDropEvent(async (event) => {
    const payload = event.payload;
    if (payload.type === 'enter' || payload.type === 'over') {
      dropzone.classList.add('converter__dropzone--active');
      return;
    }
    if (payload.type === 'leave') {
      dropzone.classList.remove('converter__dropzone--active');
      return;
    }
    if (payload.type !== 'drop') return;

    dropzone.classList.remove('converter__dropzone--active');
    if (payload.paths.length === 0) return;

    try {
      const metas = await statDesktopPaths(payload.paths);
      const files = metas.map((meta) => createDesktopFileStub(meta));
      addFiles(files);
    } catch (err) {
      console.error('Dépôt de fichiers échoué', err);
      const message =
        err instanceof Error ? err.message : 'Impossible d\'ajouter les fichiers déposés.';
      showDropAlert(message);
    }
  });
}

/** Dépôt natif Tauri : métadonnées seulement, lecture disque différée à la conversion. */
export function initTauriFileDrop(
  addFiles: FileEnqueueHandler,
  dropzone: HTMLElement,
): void {
  if (listenerBound) return;
  listenerBound = true;
  void bindTauriDropListener(addFiles, dropzone);
}
