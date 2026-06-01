import { formatListStats, parseFormatsSource } from './format-parser.js';

/** Formats documents courants (application desktop). */
const DOCUMENTS_FORMATS_SOURCE = `
.pdf* .docx* .doc* .odt* .md* .html* .rtf* .csv* .json* .epub*
`;

export const documentsFormats = parseFormatsSource(DOCUMENTS_FORMATS_SOURCE);
export const documentsFormatStats = formatListStats(documentsFormats);
