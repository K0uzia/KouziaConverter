<script lang="ts">
  import { canSelectFormat } from '@convertalllocal/capabilities';
  import type { Environment } from '@convertalllocal/capabilities';
  import { fileCount, files, selectedFormatId, showToast } from './jobStore.js';

  interface Props {
    environment?: Environment;
  }

  let { environment = 'browser' }: Props = $props();

  const canConvert = $derived.by(() => {
    if ($fileCount === 0) return false;
    const largest = $files.reduce((max, f) => (f.size > max.size ? f : max), $files[0]);
    return canSelectFormat($selectedFormatId, environment, { size: largest.size });
  });

  function onConvert() {
    if (!canConvert) return;
    showToast(
      'La conversion sera disponible prochainement. Même interface, moteur en cours de développement.',
    );
  }
</script>

<button type="button" class="convert-btn" disabled={!canConvert} onclick={onConvert}>
  Convertir
</button>
<p class="note">Moteur de conversion non implémenté. Interface prête.</p>

<style>
  .convert-btn {
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: var(--cal-radius);
    background: var(--cal-accent);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .convert-btn:hover:not(:disabled) {
    background: var(--cal-accent-hover);
  }

  .convert-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .note {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    color: var(--cal-text-muted);
    text-align: center;
  }
</style>
