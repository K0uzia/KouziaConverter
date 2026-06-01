<script lang="ts">
  import type { Environment } from '@convertalllocal/capabilities';
  import { BROWSER_MAX_FILE_BYTES } from '@convertalllocal/capabilities';

  interface Props {
    environment?: Environment;
  }

  let { environment = 'browser' }: Props = $props();

  const maxMb = Math.round(BROWSER_MAX_FILE_BYTES / (1024 * 1024));
</script>

<div class="banner" role="status">
  {#if environment === 'browser'}
    <p>
      <strong>Traitement local dans votre navigateur.</strong>
      Rien n'est envoyé sur un serveur. Les limites viennent du navigateur (mémoire, codecs),
      pas d'un modèle payant. Taille max conseillée&nbsp;: {maxMb}&nbsp;Mo par fichier.
    </p>
  {:else}
    <p>
      <strong>Application installée.</strong>
      Même outil, sans les limites du navigateur.
    </p>
  {/if}
</div>

<style>
  .banner {
    background: var(--cal-surface);
    border: 1px solid var(--cal-border);
    border-radius: var(--cal-radius);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--cal-text-muted);
  }

  .banner strong {
    color: var(--cal-text);
  }
</style>
