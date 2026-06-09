import {
  extensionFromFile,
  formatBytes,
  getMaxBytesForFile,
  getWebBatchLimitBytes,
} from '../data/app-converter-limits.ts';

export class ConvertError extends Error {
  readonly code: string;

  readonly userMessage: string;

  constructor(code: string, userMessage: string) {
    super(userMessage);
    this.name = 'ConvertError';
    this.code = code;
    this.userMessage = userMessage;
  }

  static fileTooHeavy(file?: File): ConvertError {
    const limit = file ? formatBytes(getMaxBytesForFile(file)) : 'la limite applicative';
    return new ConvertError(
      'file_too_heavy',
      `Poids : ce fichier dépasse la limite (${limit} max selon le type).`,
    );
  }

  static batchTooHeavy(totalLabel: string): ConvertError {
    return new ConvertError(
      'batch_too_heavy',
      `Poids : ${totalLabel} au total. Limite du lot dépassée.`,
    );
  }

  static unsupportedFile(): ConvertError {
    return new ConvertError(
      'unsupported_format',
      'Format : ce type de fichier n\'est pas pris en charge.',
    );
  }

  static unsupportedImageFormat(ext: string): ConvertError {
    return new ConvertError(
      'unsupported_format',
      `Format : .${ext} n'est pas pris en charge pour les images.`,
    );
  }

  static unsupportedConversion(inputLabel: string, outputLabel: string): ConvertError {
    return new ConvertError(
      'unsupported_conversion',
      `Conversion : ${inputLabel} vers ${outputLabel} n'est pas disponible.`,
    );
  }

  static svgUnreadable(): ConvertError {
    return new ConvertError(
      'svg_decode',
      'Format SVG : fichier illisible ou invalide.',
    );
  }

  static svgNoSize(): ConvertError {
    return new ConvertError(
      'svg_size',
      'Taille SVG : dimensions introuvables. Ajoutez width, height ou viewBox.',
    );
  }

  static svgVectorizeUnavailable(): ConvertError {
    return new ConvertError(
      'svg_vectorize',
      'Vectorisation SVG : moteur WASM indisponible. Relancez l\'application.',
    );
  }

  static imageUnreadable(): ConvertError {
    return new ConvertError(
      'image_decode',
      'Format image : impossible de décoder ce fichier.',
    );
  }

  static imageTooLargePixels(width: number, height: number): ConvertError {
    return new ConvertError(
      'image_pixels',
      `Image trop grande (${width}×${height} px). Réduisez la résolution ou choisissez un fichier plus léger.`,
    );
  }

  static audioUnreadable(): ConvertError {
    return new ConvertError(
      'audio_decode',
      'Format audio : lecture impossible. Essayez WAV ou MP3.',
    );
  }

  static csvEmpty(): ConvertError {
    return new ConvertError('csv_content', 'Contenu : le fichier CSV est vide.');
  }

  static jsonInvalid(): ConvertError {
    return new ConvertError('json_content', 'Contenu : le JSON n\'est pas valide.');
  }

  static jsonNeedsArray(): ConvertError {
    return new ConvertError(
      'json_shape',
      'Contenu : pour un CSV, le JSON doit être un tableau non vide.',
    );
  }

  static jsonNeedsObjects(): ConvertError {
    return new ConvertError(
      'json_shape',
      'Contenu : le tableau JSON doit contenir des objets (clés/valeurs).',
    );
  }

  static browserCanvas(): ConvertError {
    return new ConvertError(
      'browser',
      'Conversion image : le canvas n\'est pas disponible.',
    );
  }

  static encodeFailed(outputLabel: string): ConvertError {
    return new ConvertError(
      'encode_failed',
      `Conversion : impossible de produire un fichier ${outputLabel}.`,
    );
  }

  static desktopEncodeUnavailable(outputLabel: string): ConvertError {
    return new ConvertError(
      'encode_unavailable',
      `Application desktop : sortie ${outputLabel} non disponible. Choisissez WebP, PNG ou JPEG.`,
    );
  }

  static imageEncodeUnavailable(mime: string): ConvertError {
    const label = mime.replace('image/', '').toUpperCase();
    return new ConvertError(
      'encode_unavailable',
      `Encodage ${label} indisponible. Essayez AVIF, WebP, PNG ou JPEG.`,
    );
  }

  static pdfBuildFailed(): ConvertError {
    return new ConvertError(
      'pdf_build',
      'PDF : impossible de générer le fichier. Réduisez la taille ou changez de format.',
    );
  }

  static pdfReadFailed(): ConvertError {
    return new ConvertError(
      'pdf_read',
      'PDF : lecture impossible. Réessayez avec un PDF plus léger.',
    );
  }

  static pdfTooManyPages(max: number): ConvertError {
    return new ConvertError(
      'pdf_pages',
      `PDF : ce fichier dépasse ${max} pages (limite de l'application).`,
    );
  }

  static pdfEncrypted(): ConvertError {
    return new ConvertError(
      'pdf_encrypted',
      'PDF : fichier protégé par mot de passe. Déverrouillez-le avant conversion.',
    );
  }

  static pdfNoText(): ConvertError {
    return new ConvertError(
      'pdf_no_text',
      'PDF : aucun texte extractible en sortie texte. Essayez la sortie HTML pour garder l\'aperçu des pages.',
    );
  }

  static unknown(): ConvertError {
    return new ConvertError(
      'unknown',
      'Conversion impossible. Vérifiez le format et le format de sortie.',
    );
  }
}

function readConvertErrorMessage(err: unknown): string | null {
  if (err instanceof ConvertError) return err.userMessage;
  if (
    err &&
    typeof err === 'object' &&
    'userMessage' in err &&
    typeof (err as ConvertError).userMessage === 'string'
  ) {
    return (err as ConvertError).userMessage;
  }
  return null;
}

function readErrorText(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return String(err);
}

function stripDesktopInvokePrefix(raw: string): string {
  return raw
    .replace(/^.*command `convert_native_file`:\s*/i, '')
    .replace(/^convert_native_file:\s*/i, '')
    .replace(/^read_native_output:\s*/i, '')
    .replace(/^stage_native_input:\s*/i, '')
    .trim();
}

export function formatConversionError(err: unknown, file?: File): string {
  const convertMessage = readConvertErrorMessage(err);
  if (convertMessage) return convertMessage;

  const raw = readErrorText(err);
  const stripped = stripDesktopInvokePrefix(raw);
  const lower = raw.toLowerCase();

  if (/command .+ not found/i.test(raw)) {
    return 'Moteur desktop indisponible. Relancez avec make dev (recompile Rust si besoin).';
  }

  if (/invalid args/i.test(raw)) {
    if (/inputPath|input_path/i.test(raw)) {
      return 'Fichier sans chemin disque. Videz la file, redéposez les fichiers, puis réessayez.';
    }
    return 'Moteur desktop indisponible. Relancez avec make dev (recompile Rust si besoin).';
  }

  if (
    stripped.length > 0
    && stripped !== raw
    && !/^(__tauri_internals__|tauri\.invok|ipc)/i.test(stripped)
  ) {
    return stripped;
  }

  if (
    /conversion image|fichier source introuvable|chemin du fichier|codec ffmpeg|ffmpeg est introuvable|catégorie non prise en charge/i.test(
      raw,
    )
  ) {
    return raw;
  }
  if (/fichier vide|illisible|impossible de lire le contenu/i.test(raw)) {
    return 'Fichier illisible. Réessayez avec le sélecteur de fichiers ou redéposez le fichier.';
  }
  if (/ffmpeg|libreoffice|soffice/i.test(raw)) {
    return raw;
  }
  if (
    /webassembly|wasm|instantiatestreaming|failed to fetch|dynamically imported|403|mime type|unreachable|runtimeerror/i.test(
      lower,
    )
  ) {
    return 'Moteur WASM indisponible ou image trop lourde. Réduisez la taille du fichier et relancez l\'application.';
  }
  if (/out of memory|allocation failed|array buffer allocation/i.test(lower)) {
    return 'Mémoire insuffisante pour cette conversion. Réduisez la taille ou convertissez moins de fichiers à la fois.';
  }
  if (/encoding error/i.test(lower)) {
    return ConvertError.imageUnreadable().userMessage;
  }
  if (/volume|volumineux|too large|file size/i.test(raw)) {
    return ConvertError.fileTooHeavy(file).userMessage;
  }
  if (/json/i.test(raw) && /invalid|parse/i.test(lower)) {
    return ConvertError.jsonInvalid().userMessage;
  }
  if (/svg/i.test(lower)) {
    return ConvertError.svgUnreadable().userMessage;
  }
  if (/decode|décod|bitmap|image/i.test(lower)) {
    if (file && extensionFromFile(file) === 'svg') {
      return ConvertError.svgUnreadable().userMessage;
    }
    return ConvertError.imageUnreadable().userMessage;
  }
  if (/audio|mpeg|ogg/i.test(lower)) {
    return ConvertError.audioUnreadable().userMessage;
  }

  const ext = file ? extensionFromFile(file) : '';
  if (ext) {
    return `Conversion impossible pour .${ext}. Vérifiez le format de sortie.`;
  }

  return ConvertError.unknown().userMessage;
}

export function validateFileWeight(file: File): void {
  if (file.size > getMaxBytesForFile(file)) {
    throw ConvertError.fileTooHeavy(file);
  }
}

export function validateBatchWeight(totalBytes: number): void {
  if (totalBytes > getWebBatchLimitBytes()) {
    throw ConvertError.batchTooHeavy(formatBytes(totalBytes));
  }
}

function rejectedFormatLabel(file: File): string {
  const ext = extensionFromFile(file);
  if (ext) return `.${ext === 'jpeg' ? 'jpg' : ext}`;
  return file.name || 'fichier inconnu';
}

export function formatRejectedFilesMessage(files: readonly File[]): string {
  if (files.length === 0) return '';

  const labels: string[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const ext = extensionFromFile(file);
    const key = ext || file.name;
    if (seen.has(key)) continue;
    seen.add(key);
    labels.push(rejectedFormatLabel(file));
  }

  return `Format : ${labels.join(', ')} non pris en charge.`;
}
