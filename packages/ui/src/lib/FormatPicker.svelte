<script lang="ts">
  import {
    canSelectFormat,
    getLimitReason,
    getSupport,
    type Environment,
  } from '@convertalllocal/capabilities';
  import { OUTPUT_FORMATS, PRESETS, type OutputFormatId } from '@convertalllocal/core';
  import { files, selectedFormatId, selectedPresetId } from './jobStore.js';
  import UnsupportedHint from './UnsupportedHint.svelte';

  interface Props {
    environment?: Environment;
  }

  let { environment = 'browser' }: Props = $props();

  const largestFile = $derived(
    $files.length
      ? $files.reduce((max, f) => (f.size > max.size ? f : max), $files[0])
      : null,
  );

  const fileInput = $derived(largestFile ? { size: largestFile.size } : undefined);

  const activeReason = $derived(
    getLimitReason($selectedFormatId, environment, fileInput),
  );

  function selectFormat(id: OutputFormatId) {
    if (!isFormatSelectable(id)) return;
    selectedFormatId.set(id);
    const preset = PRESETS.find((p) => p.formatId === id);
    if (preset) selectedPresetId.set(preset.id);
  }

  function isFormatSelectable(id: OutputFormatId): boolean {
    return canSelectFormat(id, environment, fileInput);
  }

  function supportLabel(id: OutputFormatId): string {
    const s = getSupport(id, environment);
    if (s === 'full') return '';
    if (s === 'limited') return 'limité';
    return 'app';
  }
</script>

<div class="picker">
  <label class="label" for="format-select">Format de sortie</label>
  <div class="formats" id="format-select" role="listbox" aria-label="Formats de sortie">
    {#each OUTPUT_FORMATS as format (format.id)}
      {@const selectable = isFormatSelectable(format.id)}
      {@const label = supportLabel(format.id)}
      <button
        type="button"
        role="option"
        class="format-btn"
        class:selected={$selectedFormatId === format.id}
        class:disabled={!selectable}
        disabled={!selectable}
        aria-selected={$selectedFormatId === format.id}
        onclick={() => selectFormat(format.id)}
      >
        <span class="fmt-label">{format.label}</span>
        {#if label}
          <span class="badge">{label}</span>
        {/if}
      </button>
    {/each}
  </div>

  <label class="label" for="preset-select">Preset</label>
  <select
    id="preset-select"
    class="preset-select"
    value={$selectedPresetId}
    onchange={(e) => selectedPresetId.set((e.target as HTMLSelectElement).value)}
  >
    {#each PRESETS.filter((p) => p.formatId === $selectedFormatId) as preset (preset.id)}
      <option value={preset.id}>{preset.label}: {preset.description}</option>
    {/each}
    {#if PRESETS.filter((p) => p.formatId === $selectedFormatId).length === 0}
      <option value="">Aucun preset pour ce format</option>
    {/if}
  </select>

  {#if activeReason}
    <UnsupportedHint reason={activeReason} />
  {/if}
</div>

<style>
  .picker {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--cal-text);
  }

  .formats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .format-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
    background: var(--cal-surface);
    color: var(--cal-text);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }

  .format-btn:hover:not(.disabled) {
    border-color: var(--cal-accent);
    background: var(--cal-surface-hover);
  }

  .format-btn.selected {
    border-color: var(--cal-accent);
    background: color-mix(in srgb, var(--cal-accent) 20%, var(--cal-surface));
  }

  .format-btn.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .badge {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 0.125rem 0.375rem;
    border-radius: 999px;
    background: var(--cal-surface-hover);
    color: var(--cal-text-muted);
  }

  .preset-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
    background: var(--cal-surface);
    color: var(--cal-text);
    font-size: 0.875rem;
  }
</style>
