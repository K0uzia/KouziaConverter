<script lang="ts">
  import {
    getLimitReasonLabel,
    type LimitReason,
  } from '@convertalllocal/capabilities';

  interface Props {
    reason: LimitReason;
    downloadHref?: string;
  }

  let { reason, downloadHref = '/download' }: Props = $props();
</script>

<div class="hint">
  <p>{getLimitReasonLabel(reason)}</p>
  {#if reason === 'desktop_only'}
    <a href={downloadHref}>Télécharger l'application</a>
    <span class="sep">Même outil, sans les limites du navigateur.</span>
  {/if}
</div>

<style>
  .hint {
    background: color-mix(in srgb, var(--cal-warning) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--cal-warning) 40%, transparent);
    border-radius: var(--cal-radius);
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    color: var(--cal-text-muted);
  }

  .hint a {
    color: var(--cal-accent);
    text-decoration: none;
    font-weight: 600;
  }

  .hint a:hover {
    text-decoration: underline;
  }

  .sep {
    margin-left: 0.25rem;
  }
</style>
