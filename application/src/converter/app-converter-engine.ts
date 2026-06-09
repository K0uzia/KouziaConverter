import { invoke } from '@tauri-apps/api/core';
import { filterImageOutputFormats } from '../../../src/components/Converter/converter-image-capabilities.ts';
import type { ProgressCallback } from '../../../src/components/Converter/converter-image-engine.ts';
import { convertFile as convertWebFile } from '../../../src/components/Converter/converter-engine.ts';
import { convertImageFileDesktop } from './app-image-engine.ts';
import {
  detectCategory,
  extensionFromFile,
  type AppConverterCategory,
} from '../data/app-converter-limits.ts';
import {
  appDefaultOutputByCategory,
  outputFormatByIdApp,
  outputFormatsForCategory,
} from '../data/app-converter-output-formats.ts';
import {
  attachDesktopFilePath,
  getDesktopFilePath,
  materializeDesktopFile,
} from './app-desktop-file.ts';
import {
  assertReadableFile,
  cleanupNativePath,
  isTauriRuntime,
  readNativeOutput,
  stageFileForNativeConversion,
} from './app-native-io.ts';

export { ConvertError } from './app-converter-errors.ts';
export type { ConvertResult, ProgressCallback } from '../../../src/components/Converter/converter-image-engine.ts';

import { ConvertError, formatConversionError } from './app-converter-errors.ts';

export function getCategoryForFile(file: File): AppConverterCategory {
  const category = detectCategory(file);
  if (!category) throw ConvertError.unsupportedFile();
  return category;
}

export function resolveOutputFormat(file: File, outputId: string) {
  const category = getCategoryForFile(file);
  const inputExt = extensionFromFile(file);
  let allowed = outputFormatsForCategory(category, inputExt);
  if (category === 'image') {
    allowed = filterImageOutputFormats(allowed);
  }
  const chosen = outputFormatByIdApp(outputId);
  if (!chosen || !allowed.some((o) => o.id === chosen.id)) {
    const fallbackId = appDefaultOutputByCategory[category];
    const fromDefault = allowed.find((o) => o.id === fallbackId);
    if (fromDefault) return fromDefault;
    if (allowed[0]) return allowed[0];
    throw ConvertError.encodeFailed(outputId);
  }
  return chosen;
}

const CANVAS_IMAGE_FALLBACK_IDS = new Set(['webp', 'jpeg', 'png']);

type NativeConverterCategory = 'video' | 'office' | 'image';

async function convertNativeFile(
  file: File,
  category: NativeConverterCategory,
  outputFormatId: string,
  onProgress: ProgressCallback,
  sourcePath?: string,
) {
  if (!isTauriRuntime()) {
    throw new ConvertError(
      'native_runtime',
      'Conversion vidéo ou Office : lancez l\'application avec make dev ou pnpm tauri dev, pas le serveur Vite seul.',
    );
  }

  onProgress(0.05);
  const output = resolveOutputFormat(file, outputFormatId);
  const inputExt = extensionFromFile(file) || 'bin';
  const desktopPath = (sourcePath ?? getDesktopFilePath(file))?.trim();
  let inputPath: string | undefined;
  let ownsInputPath = false;

  try {
    if (desktopPath) {
      attachDesktopFilePath(file, desktopPath);
      inputPath = desktopPath;
      onProgress(0.2);
    } else {
      await assertReadableFile(file);
      onProgress(0.1);
      inputPath = await stageFileForNativeConversion(file, inputExt);
      ownsInputPath = true;
      onProgress(0.2);
    }

    if (!inputPath) {
      throw new ConvertError(
        'native_input',
        'Fichier sans chemin disque. Videz la file, redéposez les fichiers, puis réessayez.',
      );
    }

    const result = await invoke<{ outputPath: string; filename: string }>('convert_native_file', {
      category,
      inputName: file.name,
      inputExt,
      outputExt: output.extension,
      inputPath,
    });

    onProgress(0.85);
    const bytes = await readNativeOutput(result.outputPath);
    onProgress(0.95);
    await cleanupNativePath(result.outputPath);
    onProgress(1);

    return {
      blob: new Blob([bytes], { type: output.mime }),
      mime: output.mime,
      filename: result.filename,
    };
  } finally {
    if (ownsInputPath && inputPath) {
      await cleanupNativePath(inputPath);
    }
  }
}

function rethrowAsConvertError(err: unknown, file: File): never {
  if (err instanceof ConvertError) throw err;
  console.error('Conversion échouée', err);
  throw new ConvertError('unknown', formatConversionError(err, file));
}

async function convertImageDesktop(
  file: File,
  outputFormatId: string,
  onProgress: ProgressCallback,
  desktopPath?: string,
) {
  try {
    return await convertNativeFile(file, 'image', outputFormatId, onProgress, desktopPath);
  } catch (nativeErr) {
    const output = resolveOutputFormat(file, outputFormatId);
    if (!CANVAS_IMAGE_FALLBACK_IDS.has(output.id)) {
      throw nativeErr;
    }
    console.warn('Conversion FFmpeg échouée, repli canvas WebKit', nativeErr);
    return convertImageFileDesktop(file, output, onProgress, desktopPath);
  }
}

export async function convertFile(
  file: File,
  outputFormatId: string,
  onProgress: ProgressCallback,
  sourcePath?: string,
) {
  const category = detectCategory(file);
  const desktopPath = sourcePath ?? getDesktopFilePath(file);
  try {
    if (category === 'video' || category === 'office') {
      return await convertNativeFile(file, category, outputFormatId, onProgress, desktopPath);
    }

    if (category === 'image') {
      return await convertImageDesktop(file, outputFormatId, onProgress, desktopPath);
    }

    onProgress(0.02);
    const readyFile = await materializeDesktopFile(file, desktopPath);
    return await convertWebFile(readyFile, outputFormatId, onProgress);
  } catch (err) {
    rethrowAsConvertError(err, file);
  }
}
