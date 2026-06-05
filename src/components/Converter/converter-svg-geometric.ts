import type { SvgColorSample } from './converter-svg-profile.js';
import { traceWithStrategy } from './converter-vtracer.js';

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface RoundedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  score: number;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => v.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function buildOpaqueMask(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if ((data[i + 3] ?? 255) >= 16) mask[y * width + x] = 1;
    }
  }
  return mask;
}

function maskBounds(mask: Uint8Array, width: number, height: number): Bounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      count++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (count < 16 || maxX < 0) return null;
  return { minX, minY, maxX, maxY };
}

function isInsideRoundedRect(px: number, py: number, w: number, h: number, rx: number): boolean {
  if (px < 0 || py < 0 || px >= w || py >= h) return false;
  const r = Math.min(rx, w / 2, h / 2);
  if (px < r && py < r) {
    const dx = r - px;
    const dy = r - py;
    return dx * dx + dy * dy <= r * r;
  }
  if (px >= w - r && py < r) {
    const dx = px - (w - r);
    const dy = r - py;
    return dx * dx + dy * dy <= r * r;
  }
  if (px < r && py >= h - r) {
    const dx = r - px;
    const dy = py - (h - r);
    return dx * dx + dy * dy <= r * r;
  }
  if (px >= w - r && py >= h - r) {
    const dx = px - (w - r);
    const dy = py - (h - r);
    return dx * dx + dy * dy <= r * r;
  }
  return true;
}

function scoreRoundedRect(
  mask: Uint8Array,
  imgW: number,
  x: number,
  y: number,
  w: number,
  h: number,
  rx: number,
): number {
  let match = 0;
  let total = 0;
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const inside = isInsideRoundedRect(px - x, py - y, w, h, rx);
      const on = mask[py * imgW + px] === 1;
      if (inside === on) match++;
      total++;
    }
  }
  return total > 0 ? match / total : 0;
}

function fitRoundedRect(mask: Uint8Array, width: number, height: number): RoundedRect | null {
  const bounds = maskBounds(mask, width, height);
  if (!bounds) return null;

  const x = bounds.minX;
  const y = bounds.minY;
  const w = bounds.maxX - bounds.minX + 1;
  const h = bounds.maxY - bounds.minY + 1;
  const maxRx = Math.floor(Math.min(w, h) / 2);
  let best: RoundedRect | null = null;

  for (let rx = Math.max(2, Math.floor(maxRx * 0.12)); rx <= maxRx; rx++) {
    const score = scoreRoundedRect(mask, width, x, y, w, h, rx);
    if (!best || score > best.score) {
      best = { x, y, width: w, height: h, rx, score };
    }
  }

  const minScore = width <= 128 && height <= 128 ? 0.9 : 0.86;
  if (!best || best.score < minScore) return null;
  return best;
}

function isForegroundPixel(r: number, g: number, b: number, bg: SvgColorSample): boolean {
  const lum = luminance(r, g, b);
  if (lum >= 175) return true;
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  return Math.sqrt(dr * dr + dg * dg + db * db) > 72;
}

function sampleBackgroundColor(
  imageData: ImageData,
  rect: RoundedRect,
): SvgColorSample | null {
  const { width, height, data } = imageData;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  const roughBg: SvgColorSample = { hex: '#000000', r: 0, g: 0, b: 0, count: 0 };
  for (let py = rect.y; py < rect.y + rect.height; py++) {
    for (let px = rect.x; px < rect.x + rect.width; px++) {
      if (!isInsideRoundedRect(px - rect.x, py - rect.y, rect.width, rect.height, rect.rx)) {
        continue;
      }
      const i = (py * width + px) * 4;
      const a = data[i + 3] ?? 255;
      if (a < 16) continue;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      if (luminance(r, g, b) >= 175) continue;
      rSum += r;
      gSum += g;
      bSum += b;
      count++;
    }
  }

  if (count < 24) return null;
  const r = Math.round(rSum / count);
  const g = Math.round(gSum / count);
  const b = Math.round(bSum / count);
  roughBg.r = r;
  roughBg.g = g;
  roughBg.b = b;
  roughBg.hex = rgbToHex(r, g, b);
  roughBg.count = count;
  return roughBg;
}

function buildForegroundLayer(
  imageData: ImageData,
  rect: RoundedRect,
  background: SvgColorSample,
): ImageData | null {
  const { width, height, data } = imageData;
  const out = new Uint8ClampedArray(data.length);
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3] ?? 255;
      if (a < 16) continue;
      if (!isInsideRoundedRect(x - rect.x, y - rect.y, rect.width, rect.height, rect.rx)) {
        continue;
      }
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      if (!isForegroundPixel(r, g, b, background)) continue;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
      count++;
    }
  }

  if (count < 16) return null;
  return new ImageData(out, width, height);
}

function extractPathMarkup(svg: string): string {
  const paths = [...svg.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
  return paths.join('\n');
}

function wrapSvg(width: number, height: number, body: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n` +
    `${body}\n</svg>`
  );
}

/** Tente une reconstruction géométrique pour icônes (silhouette arrondie + symbole). */
export async function tryGeometricIconSvg(imageData: ImageData): Promise<string | null> {
  const { width, height } = imageData;
  const silhouette = buildOpaqueMask(imageData);
  const rounded = fitRoundedRect(silhouette, width, height);
  if (!rounded) return null;

  const background = sampleBackgroundColor(imageData, rounded);
  if (!background) return null;

  const foreground = buildForegroundLayer(imageData, rounded, background);
  if (!foreground) return null;

  const parts: string[] = [
    `<rect x="${rounded.x}" y="${rounded.y}" width="${rounded.width}" height="${rounded.height}" rx="${rounded.rx}" fill="${background.hex}"/>`,
  ];

  const traced = await traceWithStrategy(foreground, 'icon', { hasAlpha: true });
  const paths = extractPathMarkup(traced);
  if (!paths) return null;
  parts.push(paths);

  return wrapSvg(width, height, parts.join('\n'));
}
