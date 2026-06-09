import {
  defaultOutputByCategory,
  outputFormatById,
  outputFormatsForCategory as webOutputFormatsForCategory,
  type OutputFormatOption,
} from '../../../src/data/converter-output-formats.ts';
import type { ConverterCategory } from '../../../src/data/converter-types.ts';
import type { AppConverterCategory } from './app-converter-limits.ts';
import { appOutputFormats } from './app-output-formats.ts';

export type { OutputFormatOption };

const videoOutputFormats: OutputFormatOption[] = appOutputFormats.video.map((opt) => ({
  id: opt.id,
  label: opt.label,
  mime: `video/${opt.id === 'mkv' ? 'x-matroska' : opt.id}`,
  extension: opt.id,
  categories: ['document'],
}));

const officeOutputFormats: OutputFormatOption[] = appOutputFormats.office.map((opt) => ({
  id: opt.id,
  label: opt.label,
  mime:
    opt.id === 'pdf'
      ? 'application/pdf'
      : opt.id === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : opt.id === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/octet-stream',
  extension: opt.id,
  categories: ['document'],
}));

export const appDefaultOutputByCategory: Record<AppConverterCategory, string> = {
  ...defaultOutputByCategory,
  video: 'mp4',
  office: 'pdf',
};

export function outputFormatsForCategory(
  category: AppConverterCategory,
  inputExt?: string,
): OutputFormatOption[] {
  if (category === 'video') return videoOutputFormats;
  if (category === 'office') return officeOutputFormats;
  return webOutputFormatsForCategory(category as ConverterCategory, inputExt);
}

export function outputFormatByIdApp(id: string): OutputFormatOption | undefined {
  return (
    outputFormatById(id) ??
    videoOutputFormats.find((f) => f.id === id) ??
    officeOutputFormats.find((f) => f.id === id)
  );
}

export {
  allOutputFormats,
  audioOutputFormats,
  defaultOutputByCategory,
  documentOutputFormats,
  imageOutputFormats,
  imageOutputFormats as imageFormats,
  IMAGE_OUTPUT_FORMAT_META,
  IMAGE_OUTPUT_FORMAT_IDS,
  imageMimeForExtension,
  outputFormatById,
} from '../../../src/data/converter-output-formats.ts';
