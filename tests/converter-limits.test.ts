import { describe, expect, it } from 'vitest';
import {
  WEB_MAX_BATCH_BYTES,
  WEB_MAX_FILE_BYTES,
  WEB_MAX_TEXT_BYTES,
  formatBytes,
  getMaxBytesForFile,
  getWebBatchLimitBytes,
  webBatchLimitMoLabel,
} from '../src/data/converter-limits.js';

function mockFile(name: string, type = ''): File {
  return new File(['x'], name, { type });
}

describe('getMaxBytesForFile', () => {
  it('applique 16 Mo aux images', () => {
    expect(getMaxBytesForFile(mockFile('photo.png', 'image/png'))).toBe(WEB_MAX_FILE_BYTES);
  });

  it('applique 8 Mo au texte', () => {
    expect(getMaxBytesForFile(mockFile('data.csv', 'text/csv'))).toBe(WEB_MAX_TEXT_BYTES);
    expect(getMaxBytesForFile(mockFile('readme.md'))).toBe(WEB_MAX_TEXT_BYTES);
  });

  it('applique 16 Mo à l audio', () => {
    expect(getMaxBytesForFile(mockFile('song.mp3', 'audio/mpeg'))).toBe(WEB_MAX_FILE_BYTES);
  });
});

describe('getWebBatchLimitBytes', () => {
  it('retourne au moins 24 Mo', () => {
    expect(getWebBatchLimitBytes()).toBeGreaterThanOrEqual(WEB_MAX_BATCH_BYTES);
  });

  it('expose un libellé Mo cohérent', () => {
    const mo = webBatchLimitMoLabel();
    expect([24, 32]).toContain(mo);
  });
});

describe('formatBytes', () => {
  it('formate les unités', () => {
    expect(formatBytes(0)).toBe('0 o');
    expect(formatBytes(1024)).toBe('1 Ko');
    expect(formatBytes(24 * 1024 * 1024)).toContain('Mo');
  });
});
