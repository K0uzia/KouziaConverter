import { ConvertError } from './converter-errors.js';
import type { SvgTraceStrategy } from './converter-svg-profile.js';

type VtracerModule = typeof import('wasm_vtracer');

export type VtracerPreset = 'icon' | 'logo' | 'photo';

let vtracerModule: VtracerModule | null = null;

async function loadVtracer(): Promise<VtracerModule> {
  if (!vtracerModule) {
    vtracerModule = await import('wasm_vtracer');
  }
  return vtracerModule;
}

export function hasTransparentPixels(imageData: ImageData): boolean {
  const { data } = imageData;
  for (let i = 3; i < data.length; i += 16) {
    if ((data[i] ?? 255) < 250) return true;
  }
  return false;
}

function parseHexFill(fill: string): { r: number; g: number; b: number } | null {
  const hex = fill.match(/^#([0-9a-f]{6})$/i);
  if (!hex) return null;
  const value = Number.parseInt(hex[1]!, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function isNearBlackFill(fill: string): boolean {
  const rgb = parseHexFill(fill);
  if (!rgb) return false;
  return rgb.r <= 8 && rgb.g <= 8 && rgb.b <= 8;
}

function isFlatBackgroundRect(pathD: string): boolean {
  if (/\sZ\s+M/i.test(pathD)) return false;
  return pathD.length < 220 && /^M0 0 C/.test(pathD.trim());
}

function stripOuterCanvasSubpath(pathD: string): string {
  if (!/\sZ\s+M/i.test(pathD)) return pathD;
  const parts = pathD.split(/\s+Z\s+/).filter(Boolean);
  const first = parts[0]?.trim() ?? '';
  if (parts.length < 2 || !isFlatBackgroundRect(`${first} Z`)) return pathD;
  return parts.slice(1).map((part) => `${part.trim()} Z`).join(' ');
}

function pathComplexity(pathD: string): number {
  return (pathD.match(/\bC\b/g) ?? []).length + pathD.length / 120;
}

function isParasitePath(fill: string, pathD: string): boolean {
  if (fill === 'none') return true;
  const rgb = parseHexFill(fill);
  if (!rgb) return pathD.length < 180;

  const { r, g, b } = rgb;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;

  if (isNearBlackFill(fill) && pathComplexity(pathD) > 8) return true;
  if (lum < 20 && pathD.length > 400) return true;
  if (pathD.length < 120 && lum > 40 && lum < 220) return true;

  return false;
}

export function polishVtracerSvg(svg: string, hasAlpha: boolean): string {
  if (!hasAlpha) return svg;

  let mainFill: string | null = null;
  let out = svg.replace(
    /<path d="([^"]*)" fill="([^"]+)" transform="([^"]*)"\/>/g,
    (match, pathD: string, fill: string) => {
      if (isFlatBackgroundRect(pathD) || (isNearBlackFill(fill) && pathD.length > 300)) {
        mainFill = fill;
        return '';
      }
      return match;
    },
  );

  out = out.replace(
    /<path d="([^"]*)" fill="([^"]+)" transform="([^"]*)"\/>/g,
    (match, pathD: string, fill: string, transform: string) => {
      let d = stripOuterCanvasSubpath(pathD);
      let f = fill;
      if (isNearBlackFill(f)) return '';
      if (isParasitePath(f, d)) return '';
      if (d === pathD && f === fill) return match;
      return `<path d="${d}" fill="${f}" transform="${transform}"/>`;
    },
  );

  return out;
}

function strategyToPreset(strategy: SvgTraceStrategy): VtracerPreset {
  if (strategy === 'vtracer-photo') return 'photo';
  if (strategy === 'vtracer-logo') return 'logo';
  return 'icon';
}

function buildTracerConfig(
  imageData: ImageData,
  mod: VtracerModule,
  preset: VtracerPreset,
  hasAlpha: boolean,
): InstanceType<VtracerModule['TracerConfig']> {
  const { TracerConfig, ColorMode, PathSimplifyMode, Hierarchical } = mod;
  const config = new TracerConfig();

  config.setHierarchical(hasAlpha ? Hierarchical.Cutout : Hierarchical.Stacked);
  config.setPathSimplifyMode(PathSimplifyMode.Spline);
  config.setFilterSpeckle(hasAlpha ? 12 : 8);

  if (preset === 'icon') {
    config.setColorMode(ColorMode.Color);
    config.setColorPrecision(hasAlpha ? 5 : 6);
    config.setLayerDifference(hasAlpha ? 18 : 12);
    config.setCornerThreshold(60);
    config.setPathPrecision(2);
    config.setLengthThreshold(4);
    config.setSpliceThreshold(45);
    config.setMaxIterations(10);
    return config;
  }

  if (preset === 'logo') {
    config.setColorMode(ColorMode.Color);
    config.setColorPrecision(hasAlpha ? 4 : 5);
    config.setLayerDifference(hasAlpha ? 22 : 14);
    config.setCornerThreshold(70);
    config.setPathPrecision(2);
    config.setLengthThreshold(4.5);
    config.setSpliceThreshold(40);
    config.setMaxIterations(8);
    return config;
  }

  config.presetPhoto();
  config.setPathSimplifyMode(PathSimplifyMode.Spline);
  config.setColorPrecision(imageData.width * imageData.height > 2_000_000 ? 6 : 7);
  config.setPathPrecision(1);
  return config;
}

export async function traceWithStrategy(
  imageData: ImageData,
  preset: VtracerPreset,
  opts?: { hasAlpha?: boolean },
): Promise<string> {
  const mod = await loadVtracer();
  const hasAlpha = opts?.hasAlpha ?? hasTransparentPixels(imageData);
  const config = buildTracerConfig(imageData, mod, preset, hasAlpha);
  try {
    const rgba = new Uint8Array(
      imageData.data.buffer,
      imageData.data.byteOffset,
      imageData.data.byteLength,
    );
    const raw = mod.convertImageToSvg(rgba, imageData.width, imageData.height, config);
    if (!raw || !raw.includes('<svg')) {
      throw ConvertError.encodeFailed('svg');
    }
    return polishVtracerSvg(raw, hasAlpha);
  } catch (error) {
    if (error instanceof ConvertError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    if (/wasm|webassembly/i.test(detail)) {
      throw ConvertError.svgVectorizeUnavailable();
    }
    throw ConvertError.encodeFailed('svg');
  } finally {
    config.free();
  }
}

/** Vectorisation via VTracer selon la stratégie analysée. */
export async function traceImageDataToSvg(
  imageData: ImageData,
  strategy: SvgTraceStrategy,
): Promise<string> {
  const preset = strategyToPreset(strategy);
  return traceWithStrategy(imageData, preset, {
    hasAlpha: hasTransparentPixels(imageData),
  });
}
