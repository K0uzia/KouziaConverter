import { formatListStats, parseFormatsSource } from './format-parser.js';

/** Formats audio courants. */
const AUDIO_FORMATS_SOURCE = `
.mp3 .wav .flac .ogg .opus .aac .m4a .wma .aiff .alac .m4b .amr .ac3
`;

export const audioFormats = parseFormatsSource(AUDIO_FORMATS_SOURCE);
export const audioFormatStats = formatListStats(audioFormats);
