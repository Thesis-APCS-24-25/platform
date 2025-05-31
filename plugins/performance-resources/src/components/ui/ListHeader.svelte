<script lang="ts">
  import { AnyComponent, AnySvelteComponent, Button, IconCollapseArrow, showPopup } from '@hcengineering/ui'

  import { createEventDispatcher } from 'svelte'
  import { IntlString } from '@hcengineering/platform'

  export let collapsed: boolean = false
  export let headerBGColor: string = 'var(--hc-color-bg-header)'
  export let count: number | undefined = 0

  const dispatch = createEventDispatcher()

  let hovered: boolean = false
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  style:--header-bg-color={headerBGColor}
  class="flex-between categoryHeader row"
  class:collapsed
  on:mouseover={() => {
    hovered = true
  }}
  on:mouseout={() => {
    hovered = false
  }}
  on:click={() => dispatch('collapse')}
  on:focus={() => {
    hovered = true
  }}
  on:blur={() => {
    hovered = false
  }}
>
  <div class="flex-row-center flex-grow" style:color={'inherit'}>
    {#if count !== 0}
      <div class="chevron"><IconCollapseArrow size={'small'} /></div>
    {/if}
    <slot name="header" {count} />
  </div>
  <div class:on-hover={!hovered}>
    <slot name="action" {count} />
  </div>
</div>

<style lang="scss">
  .categoryHeader {
    position: sticky;
    top: 0;
    padding: 0 2.5rem 0 0.75rem;
    height: 2.75rem;
    min-height: 2.75rem;
    min-width: 0;
    background: var(--theme-bg-color);
    border-radius: 0.25rem 0.25rem 0 0;

    .on-hover {
      visibility: hidden;
    }

    .chevron {
      flex-shrink: 0;
      min-width: 0;
      margin-right: 0.75rem;
      color: var(--theme-caption-color);
      transform-origin: center;
      transform: rotate(90deg);
      transition: transform 0.15s ease-in-out;
    }
    &::before,
    &::after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0.25rem 0.25rem 0 0;
      pointer-events: none;
    }
    &::after {
      border: 1px solid var(--theme-list-border-color);
    }
    &.noDivide::after {
      border-bottom-color: transparent;
    }
    &::before {
      background: var(--header-bg-color);
      z-index: -1;
    }

    /* Global styles in components.scss and there is an influence from the Scroller component */
    &.collapsed {
      border-radius: 0.25rem;

      .chevron {
        transform: rotate(0deg);
      }
      &::before,
      &::after {
        border-radius: 0.25rem;
      }
      &::after {
        border-bottom-color: var(--theme-list-border-color);
      }
    }
    &.subLevel {
      top: 2.75rem;
      padding: 0 2.5rem;
      background: var(--theme-list-subheader-color);
      border-left: 1px solid var(--theme-list-subheader-divider);
      border-right: 1px solid var(--theme-list-subheader-divider);
      border-bottom: 1px solid var(--theme-list-subheader-divider);
      // here should be top 3rem for sticky, but with ExpandCollapse it gives strange behavior

      &::before,
      &::after {
        content: none;
      }
      &.collapsed.lastCat {
        border-bottom: 1px solid var(--theme-list-border-color);
        border-radius: 0 0 0.25rem 0.25rem;
      }
    }

    &.flat {
      background: var(--header-bg-color);
      background-blend-mode: darken;
      min-height: 2.25rem;
      height: 2.25rem;
      padding: 0 0.25rem 0 0.25rem;
    }
  }
</style>
