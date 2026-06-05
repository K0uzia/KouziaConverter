export function initHeaderMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-header-menu-btn]');
  const panel = document.querySelector<HTMLElement>('[data-header-mobile-nav]');
  if (!btn || !panel || btn.dataset.headerMenuBound === 'true') return;

  btn.dataset.headerMenuBound = 'true';

  const setOpen = (open: boolean): void => {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    btn.classList.toggle('header__menu-btn--open', open);
  };

  btn.addEventListener('click', () => {
    setOpen(panel.hidden);
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}
