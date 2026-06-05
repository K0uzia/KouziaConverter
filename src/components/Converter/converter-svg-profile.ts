export type SvgTraceStrategy = 'geometric-icon' | 'vtracer-icon' | 'vtracer-logo' | 'vtracer-photo';

export interface SvgColorSample {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

export interface SvgImageProfile {
  width: number;
  height: number;
  maxDimension: number;
  hasAlpha: boolean;
  colorCount: number;
  isSmallIcon: boolean;
  isLikelyPhoto: boolean;
  isLikelyBw: boolean;
  dominantColors: SvgColorSample[];
  strategy: SvgTraceStrategy;
}

const ICON_MAX_DIMENSION = 256;
const SMALL_LOGO_MAX_DIMENSION = 640;

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => v.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function bucketColor(r: number, g: number, b: number, bits: number): number {
  const shift = 8 - bits;
  const br = (r >> shift) << shift;
  const bg = (g >> shift) << shift;
  const bb = (b >> shift) << shift;
  return (br << 16) | (bg << 8) | bb;
}

export function analyzeImageForSvg(imageData: ImageData): SvgImageProfile {
  const { width, height, data } = imageData;
  const maxDimension = Math.max(width, height);
  const buckets = new Map<number, number>();
  let transparentPixels = 0;
  let opaquePixels = 0;
  let grayscalePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 255;
    if (a < 16) {
      transparentPixels++;
      continue;
    }
    opaquePixels++;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 18) grayscalePixels++;

    const key = bucketColor(r, g, b, 4);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const dominantColors = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => {
      const r = (key >> 16) & 0xff;
      const g = (key >> 8) & 0xff;
      const b = key & 0xff;
      return { hex: rgbToHex(r, g, b), r, g, b, count };
    });

  const hasAlpha = transparentPixels > 0;
  const colorCount = buckets.size;
  const significantColors = dominantColors.filter(
    (c) => c.count >= Math.max(32, opaquePixels * 0.012),
  );
  const significantColorCount = significantColors.length;
  const isSmallIcon = maxDimension <= ICON_MAX_DIMENSION;
  const grayscaleRatio = opaquePixels > 0 ? grayscalePixels / opaquePixels : 0;
  const isLikelyBw = colorCount <= 6 && grayscaleRatio > 0.92;
  const isLikelyPhoto =
    colorCount > 48 || (maxDimension > SMALL_LOGO_MAX_DIMENSION && colorCount > 28);

  let strategy: SvgTraceStrategy = 'vtracer-logo';
  if (isLikelyPhoto) {
    strategy = 'vtracer-photo';
  } else if (
    isSmallIcon &&
    hasAlpha &&
    significantColorCount >= 2 &&
    significantColorCount <= 8
  ) {
    strategy = 'geometric-icon';
  } else if (isSmallIcon || (maxDimension <= SMALL_LOGO_MAX_DIMENSION && colorCount <= 24)) {
    strategy = 'vtracer-icon';
  } else if (isLikelyBw) {
    strategy = 'vtracer-icon';
  }

  return {
    width,
    height,
    maxDimension,
    hasAlpha,
    colorCount,
    isSmallIcon,
    isLikelyPhoto,
    isLikelyBw,
    dominantColors,
    strategy,
  };
}
