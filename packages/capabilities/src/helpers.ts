import type { OutputFormatId } from '@convertalllocal/core';
import { BROWSER_MAX_FILE_BYTES, FORMAT_CAPABILITIES } from './matrix.js';
import type { Environment, FormatCapability, LimitReason, SupportLevel } from './types.js';

export function getCapability(formatId: OutputFormatId): FormatCapability | undefined {
  return FORMAT_CAPABILITIES.find((c) => c.formatId === formatId);
}

export function getSupport(formatId: OutputFormatId, env: Environment): SupportLevel {
  const cap = getCapability(formatId);
  if (!cap) return 'unsupported';
  return env === 'browser' ? cap.browser : cap.desktop;
}

export function isFormatSelectable(formatId: OutputFormatId, env: Environment): boolean {
  return getSupport(formatId, env) !== 'unsupported';
}

export interface FileCheckInput {
  size: number;
}

export function canSelectFormat(
  formatId: OutputFormatId,
  env: Environment,
  file?: FileCheckInput,
): boolean {
  const support = getSupport(formatId, env);
  if (support === 'unsupported') return false;
  if (env === 'browser' && file && file.size > BROWSER_MAX_FILE_BYTES) {
    return false;
  }
  return true;
}

export function getLimitReason(
  formatId: OutputFormatId,
  env: Environment,
  file?: FileCheckInput,
): LimitReason | null {
  const cap = getCapability(formatId);
  if (!cap) return 'no_codec';

  if (getSupport(formatId, env) === 'unsupported') {
    return cap.limitReason ?? 'desktop_only';
  }

  if (env === 'browser' && file && file.size > BROWSER_MAX_FILE_BYTES) {
    return 'browser_memory';
  }

  if (env === 'browser' && cap.browser === 'limited') {
    return cap.limitReason ?? 'browser_memory';
  }

  return null;
}

export function getLimitReasonLabel(reason: LimitReason): string {
  switch (reason) {
    case 'browser_memory':
      return 'Fichier trop volumineux pour la mémoire du navigateur';
    case 'no_codec':
      return 'Format non pris en charge dans le navigateur';
    case 'batch_not_available':
      return 'Traitement par lot non disponible dans le navigateur';
    case 'desktop_only':
      return 'Disponible dans l\'application installée';
    default:
      return 'Non disponible dans cet environnement';
  }
}

export { BROWSER_MAX_FILE_BYTES };
