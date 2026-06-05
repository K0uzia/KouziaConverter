import { formatBytes } from '../../data/converter-limits.js';

export interface OutputWeightDisplay {
  before: string;
  after: string;
  value: string;
  visible: boolean;
}

export function outputWeightDisplay(
  file: File,
  _outputFormatId: string,
  resultBytes?: number,
): OutputWeightDisplay {
  if (resultBytes === undefined || resultBytes < 0) {
    return { before: '', after: '', value: '', visible: false };
  }

  const before = formatBytes(file.size);
  const after = formatBytes(resultBytes);
  return {
    before,
    after,
    value: `${before} → ${after}`,
    visible: true,
  };
}
