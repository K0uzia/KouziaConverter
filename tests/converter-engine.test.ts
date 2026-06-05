import { describe, expect, it } from 'vitest';
import { resolveOutputFormat } from '../src/components/Converter/converter-engine.js';

function mockFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('resolveOutputFormat', () => {
  it('accepte OGG en sortie depuis Opus', () => {
    const file = mockFile('track.opus', 'audio/opus');
    const output = resolveOutputFormat(file, 'ogg');
    expect(output.id).toBe('ogg');
  });

  it('retombe sur WAV si sortie invalide pour audio', () => {
    const file = mockFile('track.mp3', 'audio/mpeg');
    const output = resolveOutputFormat(file, 'pdf');
    expect(output.id).toBe('wav');
  });

  it('retombe sur WebP pour image si sortie invalide', () => {
    const file = mockFile('pic.png', 'image/png');
    const output = resolveOutputFormat(file, 'mp3');
    expect(output.id).toBe('webp');
  });

  it('filtre HTML pour entrée TXT document', () => {
    const file = mockFile('note.txt', 'text/plain');
    const output = resolveOutputFormat(file, 'html');
    expect(output.id).toBe('pdf');
  });
});
