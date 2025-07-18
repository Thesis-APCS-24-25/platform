<!--
// Copyright © 2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { AggregateValue, Doc, PrimitiveType, Ref, Space } from '@hcengineering/core'
  import ui, {
    ActionIcon,
    AnyComponent,
    ColorDefinition,
    Component,
    IconCollapseArrow,
    IconMoreH,
    Label,
    Loading,
    defaultBackground,
    themeStore
  } from '@hcengineering/ui'
  import { AttributeModel, ViewOptions } from '@hcengineering/view'
  import { createEventDispatcher } from 'svelte'

  import view from '@hcengineering/view-resources/src/plugin'
  import {
    noCategory
  } from '@hcengineering/view-resources'

  export let groupByKey: string
  export let category: PrimitiveType | AggregateValue
  export let headerComponent: AttributeModel | undefined
  export let space: Ref<Space> | undefined
  export let limited: number
  export let items: Doc[]
  export let itemsProj: Doc[]
  export let flat = false
  export let collapsed = false
  export let lastCat = false
  export let level: number

  export let extraHeaders: AnyComponent[] | undefined
  export let props: Record<string, any> = {}
  // export let newObjectProps: (doc: Doc | undefined) => Record<string, any> | undefined

  export let viewOptions: ViewOptions
  export let loading: boolean = false

  const dispatch = createEventDispatcher()

  let accentColor: ColorDefinition | undefined = undefined

  $: showColors = (viewOptions as any).shouldShowColors !== false
  $: headerBGColor =
    level === 0 && showColors
      ? accentColor?.background ?? defaultBackground($themeStore.dark)
      : defaultBackground($themeStore.dark)

  $: headerTextColor = accentColor?.title ?? 'var(--theme-caption-color)'

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  style:z-index={10 - level}
  style:--header-bg-color={headerBGColor}
  class="flex-between categoryHeader row"
  class:flat
  class:noDivide={showColors}
  class:collapsed
  class:subLevel={level !== 0}
  class:lastCat
  class:cursor-pointer={items.length > 0}
  on:click={() => dispatch('collapse')}
>
  <div class="flex-row-center flex-grow" style:color={headerComponent !== undefined ? headerTextColor : 'inherit'}>
    <div class="chevron"><IconCollapseArrow size={level === 0 ? 'small' : 'tiny'} /></div>
    {#if groupByKey === noCategory}
      <span class="text-base fs-bold overflow-label pointer-events-none">
        <Label label={view.string.NoGrouping} />
      </span>
    {:else if category === undefined}
      <span class="overflow-label pointer-events-none">
        <Label label={view.string.NotSpecified} />
      </span>
    {:else if headerComponent}
      <svelte:component
        this={headerComponent.presenter}
        value={category}
        space={space ?? (items.every((i) => i?.space === items[0]?.space) ? items[0]?.space : undefined)}
        size={'small'}
        kind={'list-header'}
        colorInherit={!$themeStore.dark && level === 0}
        accent={level === 0}
        on:accent-color={(evt) => {
          accentColor = evt.detail
        }}
      />
    {/if}

    {#if loading && items.length === 0}
      <div class="p-1">
        <Loading shrink size={'small'} />
      </div>
    {:else}
      {#if limited < itemsProj.length}
        <div class="antiSection-header__counter flex-row-center mx-2">
          <span class="caption-color">{limited}</span>
          <span class="text-xs mx-0-5">/</span>
          {itemsProj.length}
        </div>
        {#if loading}
          <div class="p-1">
            <Loading shrink size={'small'} />
          </div>
        {:else}
          <ActionIcon
            size={'small'}
            icon={IconMoreH}
            label={ui.string.ShowMore}
            action={() => {
              dispatch('more')
            }}
          />
        {/if}
      {:else}
        <span class="antiSection-header__counter ml-2">{itemsProj.length}</span>
      {/if}
      <div class="flex-row-center flex-reverse flex-grow mr-2 gap-2 reverse">
        {#each extraHeaders ?? [] as extra}
          <Component is={extra} props={{ ...props, value: category, category: groupByKey, docs: items }} />
        {/each}
      </div>
    {/if}
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
