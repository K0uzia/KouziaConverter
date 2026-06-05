import { describe, expect, it } from 'vitest';
import { normalizeExtension } from '../src/data/format-aliases.js';

describe('normalizeExtension', () => {
  it('normalise jpg et jfif vers jpeg', () => {
    expect(normalizeExtension('jpg')).toBe('jpeg');
    expect(normalizeExtension('.jfif')).toBe('jpeg');
  });

  it('normalise tif et htm', () => {
    expect(normalizeExtension('tif')).toBe('tiff');
    expect(normalizeExtension('htm')).toBe('html');
  });

  it('laisse les extensions déjà canoniques', () => {
    expect(normalizeExtension('png')).toBe('png');
    expect(normalizeExtension('mp3')).toBe('mp3');
  });
});
