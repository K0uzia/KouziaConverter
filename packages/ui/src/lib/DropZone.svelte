<script lang="ts">
  import { addFiles } from './jobStore.js';

  let dragOver = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();

  function onFiles(selected: FileList | null) {
    if (!selected?.length) return;
    addFiles(selected);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    onFiles(e.dataTransfer?.files ?? null);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }

  function onDragLeave() {
    dragOver = false;
  }

  function onInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onFiles(target.files);
    target.value = '';
  }
</script>

<div
  class="zone"
  class:zone-active={dragOver}
  role="button"
  tabindex="0"
  ondrop={onDrop}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  onclick={() => inputEl?.click()}
  onkeydown={(e) => e.key === 'Enter' && inputEl?.click()}
>
  <input
    bind:this={inputEl}
    type="file"
    multiple
    class="hidden"
    onchange={onInputChange}
    aria-hidden="true"
  />
  <p class="title">Glissez vos fichiers ici</p>
  <p class="sub">ou cliquez pour sélectionner. Tout reste sur votre machine.</p>
</div>

<style>
  .zone {
    border: 2px dashed var(--cal-border);
    border-radius: var(--cal-radius);
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--cal-surface);
  }

  .zone:hover,
  .zone-active {
    border-color: var(--cal-accent);
    background: var(--cal-surface-hover);
  }

  .hidden {
    display: none;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--cal-text);
  }

  .sub {
    margin: 0;
    font-size: 0.875rem;
    color: var(--cal-text-muted);
  }
</style>
