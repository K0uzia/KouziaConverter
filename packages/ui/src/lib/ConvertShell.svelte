<script lang="ts">
  import type { Environment } from '@convertalllocal/capabilities';
  import CapabilityBanner from './CapabilityBanner.svelte';
  import ConvertButton from './ConvertButton.svelte';
  import DropZone from './DropZone.svelte';
  import FileList from './FileList.svelte';
  import FormatPicker from './FormatPicker.svelte';
  import { toastMessage } from './jobStore.js';
  import '@convertalllocal/ui/styles/tokens.css';

  interface Props {
    environment?: Environment;
  }

  let { environment = 'browser' }: Props = $props();
</script>

<div class="cal-ui shell">
  <CapabilityBanner {environment} />
  <div class="workspace">
    <section class="panel input-panel">
      <h2 class="panel-title">Fichiers</h2>
      <DropZone />
      <FileList {environment} />
    </section>
    <section class="panel output-panel">
      <h2 class="panel-title">Sortie</h2>
      <FormatPicker {environment} />
      <ConvertButton {environment} />
    </section>
  </div>

  {#if $toastMessage}
    <div class="toast" role="alert">{$toastMessage}</div>
  {/if}
</div>

<style>
  .shell {
    max-width: 960px;
    margin: 0 auto;
  }

  .workspace {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-top: 1.25rem;
  }

  @media (max-width: 768px) {
    .workspace {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: var(--cal-bg);
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
    padding: 1rem;
  }

  .panel-title {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--cal-text);
  }

  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    max-width: min(90vw, 28rem);
    padding: 0.75rem 1.25rem;
    background: var(--cal-surface);
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    font-size: 0.875rem;
    z-index: 100;
  }
</style>
