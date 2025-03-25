<script lang="ts">
  export let value: number
  export let target: number
  export let unit: string
</script>

<span>
  <strong>{value}</strong>
  {#if unit !== undefined}
    <span> {unit}</span>
  {/if}
  {#if target !== undefined}
    <span> / {target}</span>
  {/if}
</span>
