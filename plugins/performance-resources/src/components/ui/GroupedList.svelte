<script lang="ts">
  import { Doc } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { AnySvelteComponent, AnyComponent, ExpandCollapse, ListView } from '@hcengineering/ui'
  import ListHeader from './ListHeader.svelte'
  import { showMenu } from '@hcengineering/view-resources'

  export let categories: any[] = []
  export let items: Doc[] = []
  export let key: string
  export let createComponent: AnySvelteComponent | AnyComponent | undefined = undefined
  export let createComponentProps: Record<string, any> | undefined = undefined
  export let createLabel: IntlString | undefined = undefined

  const collapsed: boolean[] = Array(items.length).fill(true)

  let mapping = new Map<any, Doc[]>()
  $: {
    mapping = new Map<any, Doc[]>()
    items.forEach((item) => {
      const attr = Object.entries(item).find(([k]) => k === key)?.[1]
      if (!mapping.has(attr)) {
        mapping.set(attr, [])
      }
      mapping.get(attr)?.push(item)
    })
  }
  $: focusIndexes = items.map(() => -1)
</script>

<div class="flex-col-stretch flex-gap-2">
  {#each categories as category, idx}
    <div>
      <ListHeader
        count={mapping.get(category)?.length ?? 0}
        collapsed={collapsed[idx]}
        headerBGColor={'var(--header-bg-color)'}
        on:collapse={() => {
          collapsed[idx] = !collapsed[idx]
        }}
      >
        <svelte:fragment slot="header" let:count>
          <slot name="header" {category} item={idx} {count} />
        </svelte:fragment>
        <svelte:fragment slot="action" let:count>
          <slot name="action" {category} item={idx} {count} />
        </svelte:fragment>
      </ListHeader>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <ExpandCollapse isExpanded={!collapsed[idx]}>
        <div class="list-content" class:collapsed={collapsed[idx]}>
          <ListView
            count={mapping.get(category)?.length ?? 0}
            addClass={'step-tb-2-accent list-content'}
            kind="full-size"
            selection={focusIndexes[idx] !== -1 ? focusIndexes[idx] : -1}
          >
            <svelte:fragment slot="item" let:item>
              {@const itemData = mapping.get(category)?.[item]}
              <div
                class="list-item"
                on:contextmenu={(ev) => {
                  showMenu(ev, { object: mapping.get(category)?.[item] })
                }}
                on:mouseenter={() => {
                  focusIndexes = focusIndexes.map((_, i) => (i === idx ? item : -1))
                }}
                on:focus={() => {}}
                on:mouseleave={() => {
                  focusIndexes = focusIndexes.map(() => -1)
                }}
              >
                {#if itemData}
                  <slot name="item" item={itemData} {category} />
                {/if}
              </div>
            </svelte:fragment>
          </ListView>
        </div>
      </ExpandCollapse>
    </div>
  {/each}
</div>

<style lang="scss">
  .list-content {
    background-color: var(--theme-list-row-color);
    border-radius: 0rem 0rem 0.25rem 0.25rem;
    border: 1px solid var(--theme-list-border-color);
    border-top: none;

    &.collapsed {
      visibility: hidden;
    }
  }

  .list-item {
    padding-left: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--hc-color-text);
  }
</style>
