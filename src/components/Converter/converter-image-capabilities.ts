import type { OutputFormatOption } from '../../data/converter-output-formats.js';

let heicEncodeSupported: boolean | null = null;
let heifEncodeSupported: boolean | null = null;
let probePromise: Promise<void> | null = null;

async function testCanvasMime(mime: string): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.fillRect(0, 0, 1, 1);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime));
  return blob !== null && blob.size > 0;
}

/** Détecte une fois si le navigateur peut encoder HEIC/HEIF via canvas.toBlob. */
export function probeImageEncodeCapabilities(): Promise<void> {
  if (heicEncodeSupported !== null) return Promise.resolve();
  if (probePromise) return probePromise;

  probePromise = (async () => {
    const [heic, heif] = await Promise.all([
      testCanvasMime('image/heic'),
      testCanvasMime('image/heif'),
    ]);
    heicEncodeSupported = heic;
    heifEncodeSupported = heif;
  })();

  return probePromise;
}

export function isHeicEncodeAvailable(): boolean {
  return heicEncodeSupported === true;
}

export function isHeifEncodeAvailable(): boolean {
  return heifEncodeSupported === true;
}

export function filterImageOutputFormats(options: OutputFormatOption[]): OutputFormatOption[] {
  return options.filter((opt) => {
    if (opt.id === 'heic' && !isHeicEncodeAvailable()) return false;
    if (opt.id === 'heif' && !isHeifEncodeAvailable()) return false;
    return true;
  });
}
