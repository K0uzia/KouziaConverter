import {
  initConverterUi,
  setDesktopFileDropRegistrar,
  setDesktopQueueBridge,
} from '../../src/components/Converter/converter-ui.ts';
import { initConverterSettings } from '../../src/components/Converter/converter-settings-ui.ts';
import { formatConversionError } from './converter/app-converter-errors.ts';
import { desktopQueueBridge } from './converter/app-queue-bridge.ts';
import { initTauriFileDrop } from './converter/app-tauri-drop.ts';
import { WEB_ACCEPT_ATTR } from './data/app-converter-limits.ts';
import { initAppSettingsExtensions } from './app-settings-ui.ts';

setDesktopFileDropRegistrar(initTauriFileDrop);
setDesktopQueueBridge(desktopQueueBridge);

function showConverterAlert(message: string): void {
  const alertEl = document.querySelector<HTMLElement>('[data-converter-dropzone-alert]');
  if (!alertEl) return;
  alertEl.hidden = false;
  alertEl.textContent = message;
  document.querySelector('[data-converter-dropzone]')?.classList.add('converter__dropzone--reject');
}

function installGlobalErrorGuards(): void {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée', event.reason);
    showConverterAlert(formatConversionError(event.reason));
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.error('Erreur non gérée', event.error ?? event.message);
    showConverterAlert(formatConversionError(event.error ?? event.message));
  });
}

async function bootConverter(): Promise<void> {
  installGlobalErrorGuards();

  const input = document.querySelector<HTMLInputElement>('[data-converter-input]');
  if (input) input.accept = WEB_ACCEPT_ATTR;

  try {
    initAppSettingsExtensions();
    await initConverterSettings();
    await initConverterUi();
  } catch (err) {
    console.error('Initialisation du convertisseur échouée', err);
    showConverterAlert(
      'Convertisseur indisponible. Relancez l\'application avec make dev (pas pnpm dev seul).',
    );
  }
}

void bootConverter();
