import type { OutputFormatId } from '@convertalllocal/core';

export type Environment = 'browser' | 'desktop';

export type SupportLevel = 'full' | 'limited' | 'unsupported';

export type LimitReason =
  | 'browser_memory'
  | 'no_codec'
  | 'batch_not_available'
  | 'desktop_only';

export interface FormatCapability {
  formatId: OutputFormatId;
  browser: SupportLevel;
  desktop: SupportLevel;
  limitReason?: LimitReason;
}
