import { analyticsConsentStorageKey } from '../../data/site';

export type AnalyticsConsentChoice = 'granted' | 'denied';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const consentParams = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

export function getStoredAnalyticsConsent(): AnalyticsConsentChoice | null {
  try {
    const value = localStorage.getItem(analyticsConsentStorageKey);
    if (value === 'granted' || value === 'denied') return value;
  } catch {
    return null;
  }
  return null;
}

export function saveAnalyticsConsent(choice: AnalyticsConsentChoice): void {
  try {
    localStorage.setItem(analyticsConsentStorageKey, choice);
  } catch {
    /* stockage indisponible */
  }
}

export function updateAnalyticsConsent(choice: AnalyticsConsentChoice): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    ...consentParams,
    analytics_storage: choice,
  });
}

function hideBanner(banner: HTMLElement): void {
  banner.hidden = true;
}

function showBanner(banner: HTMLElement): void {
  banner.hidden = false;
  const acceptBtn = banner.querySelector<HTMLButtonElement>('[data-consent-accept]');
  acceptBtn?.focus();
}

function applyChoice(banner: HTMLElement, choice: AnalyticsConsentChoice): void {
  saveAnalyticsConsent(choice);
  updateAnalyticsConsent(choice);
  hideBanner(banner);
}

function bindConsentBanner(banner: HTMLElement): void {
  if (banner.dataset.consentBound === 'true') return;

  const acceptBtn = banner.querySelector<HTMLButtonElement>('[data-consent-accept]');
  const denyBtn = banner.querySelector<HTMLButtonElement>('[data-consent-deny]');
  if (!acceptBtn || !denyBtn) return;

  banner.dataset.consentBound = 'true';

  const stored = getStoredAnalyticsConsent();
  if (stored) {
    hideBanner(banner);
  } else {
    showBanner(banner);
  }

  acceptBtn.addEventListener('click', () => applyChoice(banner, 'granted'));
  denyBtn.addEventListener('click', () => applyChoice(banner, 'denied'));
}

export function initConsentBanner(): void {
  document.querySelectorAll<HTMLElement>('[data-consent-banner]').forEach(bindConsentBanner);
  document.querySelectorAll<HTMLButtonElement>('[data-consent-manage]').forEach((button) => {
    if (button.dataset.consentManageBound === 'true') return;
    button.dataset.consentManageBound = 'true';
    button.addEventListener('click', () => {
      document.querySelectorAll<HTMLElement>('[data-consent-banner]').forEach(showBanner);
    });
  });
}
