export function baseFilename(file: File): string {
  return file.name.replace(/\.[^.]+$/, '') || 'converti';
}
