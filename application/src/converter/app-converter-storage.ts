import type { ConverterCategory } from '../../../src/data/converter-types.ts';
import {
  isValidOutputId,
  type AppSettingsCategory,
} from '../data/app-output-formats.ts';
import { appDefaultOutputByCategory } from '../data/app-converter-output-formats.ts';
import type { AppConverterCategory } from '../data/app-converter-limits.ts';

const PREFIX = 'cal-app:';
const keyFor = (category: AppSettingsCategory | ConverterCategory | AppConverterCategory): string =>
  `${PREFIX}outputFormat:${category}`;

type StorageCategory = AppSettingsCategory | ConverterCategory;

function defaultFor(category: StorageCategory): string {
  if (category in appDefaultOutputByCategory) {
    return appDefaultOutputByCategory[category as AppConverterCategory];
  }
  return appDefaultOutputByCategory[category as AppConverterCategory];
}

function isValid(category: StorageCategory, id: string): boolean {
  return isValidOutputId(category as AppSettingsCategory, id);
}

export function getOutputFormat(category: StorageCategory): string {
  if (typeof localStorage === 'undefined') return defaultFor(category);
  const stored = localStorage.getItem(keyFor(category));
  if (stored && isValid(category, stored)) return stored;
  return defaultFor(category);
}

export function setOutputFormat(category: StorageCategory, id: string): void {
  if (typeof localStorage === 'undefined') return;
  if (!isValid(category, id)) return;
  localStorage.setItem(keyFor(category), id);
}

export function resetOutputFormat(category: StorageCategory): void {
  setOutputFormat(category, defaultFor(category));
}

export function listKeys(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  return keys;
}

export function clearAll(): void {
  if (typeof localStorage === 'undefined') return;
  for (const key of listKeys()) {
    localStorage.removeItem(key);
  }
}
