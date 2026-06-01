<script lang="ts">
  import { BROWSER_MAX_FILE_BYTES } from '@convertalllocal/capabilities';
  import type { Environment } from '@convertalllocal/capabilities';
  import { files, removeFile, clearFiles } from './jobStore.js';

  interface Props {
    environment?: Environment;
  }

  let { environment = 'browser' }: Props = $props();

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  function isOversized(size: number): boolean {
    return environment === 'browser' && size > BROWSER_MAX_FILE_BYTES;
  }
</script>

{#if $files.length > 0}
  <div class="list-wrap">
    <div class="list-header">
      <span>{$files.length} fichier{$files.length > 1 ? 's' : ''}</span>
      <button type="button" class="link-btn" onclick={() => clearFiles()}>Tout effacer</button>
    </div>
    <ul class="list">
      {#each $files as item (item.id)}
        <li class:oversized={isOversized(item.size)}>
          <div class="info">
            <span class="name">{item.name}</span>
            <span class="meta">{formatSize(item.size)} · {item.kind}</span>
            {#if isOversized(item.size)}
              <span class="warn">Dépasse la limite navigateur</span>
            {/if}
          </div>
          <button
            type="button"
            class="remove"
            aria-label="Retirer {item.name}"
            onclick={() => removeFile(item.id)}
          >
            ×
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .list-wrap {
    margin-top: 1rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: var(--cal-text-muted);
    margin-bottom: 0.5rem;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--cal-accent);
    cursor: pointer;
    font-size: inherit;
    padding: 0;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    background: var(--cal-surface);
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
  }

  .list li.oversized {
    border-color: color-mix(in srgb, var(--cal-warning) 50%, var(--cal-border));
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .name {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-size: 0.75rem;
    color: var(--cal-text-muted);
  }

  .warn {
    font-size: 0.75rem;
    color: var(--cal-warning);
  }

  .remove {
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: var(--cal-radius);
    background: var(--cal-surface-hover);
    color: var(--cal-text-muted);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
  }

  .remove:hover {
    background: var(--cal-danger);
    color: white;
  }
</style>
