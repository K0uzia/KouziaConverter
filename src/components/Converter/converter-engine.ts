import {
  defaultOutputByCategory,
  outputFormatById,
  outputFormatsForCategory,
} from '../../data/converter-output-formats.js';
import {
  detectCategory,
  extensionFromFile,
  type ConverterCategory,
} from '../../data/converter-limits.js';
import { filterImageOutputFormats } from './converter-image-capabilities.js';
import { ConvertError } from './converter-errors.js';
import type { ConvertResult, ProgressCallback } from './converter-image-engine.js';

export { ConvertError } from './converter-errors.js';
export type { ConvertResult, ProgressCallback } from './converter-image-engine.js';

export function getCategoryForFile(file: File): ConverterCategory {
  const category = detectCategory(file);
  if (!category) {
    throw ConvertError.unsupportedFile();
  }
  return category;
}

export function resolveOutputFormat(file: File, outputId: string) {
  const category = getCategoryForFile(file);
  const inputExt = extensionFromFile(file);
  let allowed = outputFormatsForCategory(category, inputExt);
  if (category === 'image') allowed = filterImageOutputFormats(allowed);
  const chosen = outputFormatById(outputId);
  if (!chosen || !allowed.some((o) => o.id === chosen.id)) {
    const fallbackId = defaultOutputByCategory[category];
    const fromDefault = allowed.find((o) => o.id === fallbackId);
    if (fromDefault) return fromDefault;
    if (allowed[0]) return allowed[0];
    const fallback = outputFormatById(fallbackId);
    if (!fallback) throw ConvertError.encodeFailed(outputId);
    return fallback;
  }
  return chosen;
}

export async function convertFile(
  file: File,
  outputFormatId: string,
  onProgress: ProgressCallback,
): Promise<ConvertResult> {
  const category = getCategoryForFile(file);
  const output = resolveOutputFormat(file, outputFormatId);
  const inputExt = extensionFromFile(file);

  if (output.id === 'pdf') {
    if (category === 'image' || category === 'document') {
      const { convertFileToPdfOutput } = await import('./converter-pdf-engine.js');
      return convertFileToPdfOutput(file, category, onProgress);
    }
    throw ConvertError.unsupportedConversion(inputExt ? `.${inputExt}` : 'fichier', output.label);
  }

  if (category === 'document' && inputExt === 'pdf') {
    const { convertPdfFile } = await import('./converter-pdf-engine.js');
    return convertPdfFile(file, output, onProgress);
  }

  if (category === 'image') {
    const { convertImageFile } = await import('./converter-image-engine.js');
    return convertImageFile(file, output, onProgress);
  }
  if (category === 'audio') {
    const { convertAudioFile } = await import('./converter-audio-engine.js');
    return convertAudioFile(file, output, onProgress);
  }
  const { convertDocumentFile } = await import('./converter-document-engine.js');
  return convertDocumentFile(file, output, onProgress);
}
