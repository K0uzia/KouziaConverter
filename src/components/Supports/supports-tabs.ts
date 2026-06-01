export function initSupportsTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-supports-tabs]').forEach((root) => {
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const panels = root.querySelectorAll<HTMLElement>('[role="tabpanel"]');

    const activate = (name: string): void => {
      tabs.forEach((tab) => {
        const active = tab.dataset.tab === name;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.classList.toggle('is-active', active);
      });
      panels.forEach((panel) => {
        const active = panel.dataset.panel === name;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
    };

    tabs.forEach((tab) => {
      if (tab.dataset.supportsTabsBound === 'true') return;
      tab.dataset.supportsTabsBound = 'true';

      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (tabName === 'site' || tabName === 'app') activate(tabName);
      });
    });
  });
}
