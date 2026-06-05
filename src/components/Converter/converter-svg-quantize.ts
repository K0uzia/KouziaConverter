import type { SvgColorSample } from './converter-svg-profile.js';

const CLUSTER_TOLERANCE = 32;

function colorDistance(r: number, g: number, b: number, sample: SvgColorSample): number {
  const dr = r - sample.r;
  const dg = g - sample.g;
  const db = b - sample.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function mergeClusters(samples: SvgColorSample[]): SvgColorSample[] {
  const clusters: SvgColorSample[] = [];

  for (const sample of samples) {
    let merged = false;
    for (const cluster of clusters) {
      if (colorDistance(sample.r, sample.g, sample.b, cluster) <= CLUSTER_TOLERANCE) {
        const total = cluster.count + sample.count;
        cluster.r = Math.round((cluster.r * cluster.count + sample.r * sample.count) / total);
        cluster.g = Math.round((cluster.g * cluster.count + sample.g * sample.count) / total);
        cluster.b = Math.round((cluster.b * cluster.count + sample.b * sample.count) / total);
        cluster.count = total;
        cluster.hex = `#${cluster.r.toString(16).padStart(2, '0')}${cluster.g.toString(16).padStart(2, '0')}${cluster.b.toString(16).padStart(2, '0')}`;
        merged = true;
        break;
      }
    }
    if (!merged) clusters.push({ ...sample });
  }

  return clusters.sort((a, b) => b.count - a.count);
}

function nearestCluster(
  r: number,
  g: number,
  b: number,
  clusters: SvgColorSample[],
): SvgColorSample {
  let best = clusters[0]!;
  let bestDist = Infinity;
  for (const cluster of clusters) {
    const dist = colorDistance(r, g, b, cluster);
    if (dist < bestDist) {
      bestDist = dist;
      best = cluster;
    }
  }
  return best;
}

/** Réduit les couleurs anti-alias avant vectorisation. */
export function quantizeImageColors(imageData: ImageData, maxClusters = 8): ImageData {
  const { width, height, data } = imageData;
  const buckets = new Map<string, SvgColorSample>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 255;
    if (a < 16) continue;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const key = `${r},${g},${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      buckets.set(key, {
        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
        r,
        g,
        b,
        count: 1,
      });
    }
  }

  const clusters = mergeClusters([...buckets.values()]).slice(0, maxClusters);
  if (clusters.length < 2) return imageData;

  const out = new Uint8ClampedArray(data);
  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3] ?? 255;
    if (a < 16) continue;
    const nearest = nearestCluster(out[i] ?? 0, out[i + 1] ?? 0, out[i + 2] ?? 0, clusters);
    out[i] = nearest.r;
    out[i + 1] = nearest.g;
    out[i + 2] = nearest.b;
  }

  return new ImageData(out, width, height);
}
