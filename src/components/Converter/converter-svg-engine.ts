import { tryGeometricIconSvg } from './converter-svg-geometric.js';
import { analyzeImageForSvg } from './converter-svg-profile.js';
import { quantizeImageColors } from './converter-svg-quantize.js';
import { traceImageDataToSvg as traceWithVtracer } from './converter-vtracer.js';

export type { SvgImageProfile, SvgTraceStrategy } from './converter-svg-profile.js';

function prepareImageForSvg(imageData: ImageData, strategy: ReturnType<typeof analyzeImageForSvg>['strategy']): ImageData {
  const maxClusters =
    strategy === 'vtracer-logo' ? 6 : strategy === 'geometric-icon' || strategy === 'vtracer-icon' ? 8 : 12;
  return quantizeImageColors(imageData, maxClusters);
}

/** Analyse l'image et choisit le pipeline SVG le plus adapté. */
export async function traceImageDataToSvg(imageData: ImageData): Promise<string> {
  const profile = analyzeImageForSvg(imageData);
  const prepared = prepareImageForSvg(imageData, profile.strategy);

  if (profile.strategy === 'geometric-icon') {
    const geometric = await tryGeometricIconSvg(prepared);
    if (geometric) return geometric;
    const fallback =
      profile.isLikelyBw || profile.dominantColors.length <= 4 ? 'vtracer-logo' : 'vtracer-icon';
    return traceWithVtracer(prepared, fallback);
  }

  return traceWithVtracer(prepared, profile.strategy);
}
