import { describe, expect, it } from 'vitest';
import {
  imageMimeForExtension,
  outputFormatsForCategory,
} from '../src/data/converter-output-formats.js';

describe('outputFormatsForCategory', () => {
  it('expose toutes les sorties image sans filtre entrée', () => {
    const formats = outputFormatsForCategory('image', 'png');
    const ids = formats.map((f) => f.id);
    expect(ids).toContain('webp');
    expect(ids).toContain('pdf');
    expect(formats.length).toBeGreaterThanOrEqual(14);
  });

  it('filtre les sorties document selon entrée', () => {
    const fromCsv = outputFormatsForCategory('document', 'csv').map((f) => f.id);
    expect(fromCsv).toEqual(['json']);

    const fromMd = outputFormatsForCategory('document', 'md').map((f) => f.id);
    expect(fromMd).toContain('html');
    expect(fromMd).toContain('pdf');
    expect(fromMd).not.toContain('json');
  });

  it('expose WAV, MP3 et OGG pour toute entrée audio', () => {
    const fromOpus = outputFormatsForCategory('audio', 'opus').map((f) => f.id);
    expect(fromOpus).toEqual(['wav', 'mp3', 'ogg']);
  });
});

describe('imageMimeForExtension', () => {
  it('retourne le MIME depuis les métadonnées sortie', () => {
    expect(imageMimeForExtension('webp')).toBe('image/webp');
    expect(imageMimeForExtension('jpg')).toBe('image/jpeg');
  });
});
