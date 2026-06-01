import { formatListStats, parseFormatsSource } from './format-parser.js';

/** Formats vidéo courants (application desktop). */
const VIDEO_FORMATS_SOURCE = `
.mp4* .mkv* .webm* .mov* .avi* .wmv* .m4v* .flv* .mpeg* .mpg* .3gp* .ogv* .ts* .m2ts*
`;

export const videoFormats = parseFormatsSource(VIDEO_FORMATS_SOURCE);
export const videoFormatStats = formatListStats(videoFormats);
