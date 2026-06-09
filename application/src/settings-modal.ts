function initSettingsModal(): void {
  const modal = document.querySelector<HTMLDialogElement>('[data-app-settings-modal]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-app-settings-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-app-settings-close]');

  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modal.showModal();
  });

  closeBtn?.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
}

initSettingsModal();
