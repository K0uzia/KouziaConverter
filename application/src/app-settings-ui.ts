import {
  getOutputFormat,
  resetOutputFormat,
  setOutputFormat,
} from './converter/app-converter-storage.ts';
import {
  bindFormatPickerGlobalListeners,
  createFormatPickerField,
} from '../../src/components/Converter/converter-format-picker.ts';
import {
  outputOptionsForCategory,
  settingsOutputAria,
  settingsOutputListAria,
  type AppSettingsCategory,
} from './data/app-output-formats.ts';

const EXTENSION_CATEGORIES: AppSettingsCategory[] = ['video', 'office'];

function mountOutputPicker(
  root: HTMLElement,
  category: AppSettingsCategory,
): void {
  const mount = root.querySelector<HTMLElement>(`[data-settings-output-picker="${category}"]`);
  if (!mount) return;

  const options = outputOptionsForCategory(category);
  const stored = getOutputFormat(category);
  const value = options.some((o) => o.id === stored) ? stored : (options[0]?.id ?? stored);

  const picker = createFormatPickerField({
    id: `settings-output-${category}`,
    variant: 'settings',
    ariaLabel: settingsOutputAria(category),
    listAriaLabel: settingsOutputListAria(category),
    options,
    value,
    onChange: (nextId) => {
      setOutputFormat(category, nextId);
      document.dispatchEvent(
        new CustomEvent('cal:output-format-changed', { detail: { category } }),
      );
    },
  });
  mount.replaceChildren(picker);
}

export function initAppSettingsExtensions(): void {
  bindFormatPickerGlobalListeners();

  const root = document.querySelector<HTMLElement>('[data-converter-settings]');
  if (!root || root.dataset.appExtensionsBound === 'true') return;
  root.dataset.appExtensionsBound = 'true';

  for (const category of EXTENSION_CATEGORIES) {
    mountOutputPicker(root, category);

    const resetBtn = root.querySelector<HTMLButtonElement>(
      `[data-settings-reset-output="${category}"]`,
    );
    if (!resetBtn || resetBtn.dataset.settingsResetBound === 'true') continue;

    resetBtn.dataset.settingsResetBound = 'true';
    resetBtn.addEventListener('click', () => {
      resetOutputFormat(category);
      mountOutputPicker(root, category);
      document.dispatchEvent(
        new CustomEvent('cal:output-format-changed', { detail: { category } }),
      );
    });
  }
}
