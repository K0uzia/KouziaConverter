import { initSupportsTabs } from './supports-tabs.ts';

const STEP_DEG = 90;

function shortestSteps(delta: number, count: number): number {
  let steps = delta;
  const half = count / 2;
  if (steps > half) steps -= count;
  if (steps < -half) steps += count;
  return steps;
}

export function initSupportsWheel(): void {
  const root = document.querySelector<HTMLElement>('[data-supports-wheel]');
  if (!root) return;

  const ring = root.querySelector<HTMLElement>('[data-wheel-ring]');
  const panels = root.querySelectorAll<HTMLElement>('[data-wheel-panel]');
  const pills = root.querySelectorAll<HTMLButtonElement>('[data-wheel-pill]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeIndex = 0;
  let currentRotation = 0;

  const applyRingRotation = (): void => {
    if (!ring) return;
    ring.style.setProperty('--wheel-rotation', `${currentRotation}deg`);
    ring.style.transform = `rotate(${currentRotation}deg)`;
  };

  const activate = (index: number): void => {
    if (index < 0 || index >= panels.length) return;

    if (index !== activeIndex) {
      const steps = shortestSteps(index - activeIndex, panels.length);
      currentRotation -= steps * STEP_DEG;
      applyRingRotation();
    }

    activeIndex = index;

    panels.forEach((panel, i) => {
      const on = i === index;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });

    pills.forEach((pill) => {
      const pillIndex = Number(pill.dataset.wheelIndex);
      const on = pillIndex === index;
      pill.setAttribute('aria-selected', on ? 'true' : 'false');
      pill.classList.toggle('is-active', on);
      pill.tabIndex = on ? 0 : -1;
    });

    initSupportsTabs();
  };

  const bindPills = (): void => {
    pills.forEach((pill) => {
      if (pill.dataset.wheelBound === 'true') return;
      pill.dataset.wheelBound = 'true';

      pill.addEventListener('click', () => {
        const index = Number(pill.dataset.wheelIndex);
        if (!Number.isNaN(index)) activate(index);
      });

      pill.addEventListener('keydown', (event) => {
        const count = panels.length;
        let next = activeIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          next = (activeIndex + 1) % count;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          next = (activeIndex - 1 + count) % count;
        } else if (event.key === 'Home') {
          event.preventDefault();
          next = 0;
        } else if (event.key === 'End') {
          event.preventDefault();
          next = count - 1;
        } else {
          return;
        }

        activate(next);
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        const selector = isDesktop
          ? `.supports__wheel-pill[data-wheel-index="${next}"]`
          : `.supports__wheel-pill-mobile[data-wheel-index="${next}"]`;
        root.querySelector<HTMLButtonElement>(selector)?.focus();
      });
    });
  };

  if (ring && !reducedMotion) {
    ring.style.transition = `transform var(--supports-wheel-duration) var(--supports-wheel-ease)`;
  }

  bindPills();
  applyRingRotation();
  activate(0);
}
