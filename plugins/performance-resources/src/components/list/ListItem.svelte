<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  import { Doc, getObjectValue, Space } from '@hcengineering/core'
  import notification from '@hcengineering/notification'
  import { Component, IconCircles, tooltip, deviceOptionsStore as deviceInfo } from '@hcengineering/ui'
  import { AttributeModel } from '@hcengineering/view'
  import { createEventDispatcher, onMount } from 'svelte'
  import view from '@hcengineering/view-resources/src/plugin'
  import GrowPresenter from './GrowPresenter.svelte'
  import ListPresenter from './ListPresenter.svelte'
  import { restrictionStore } from '@hcengineering/view-resources'

  export let docObject: Doc
  export let model: AttributeModel[]
  export let groupByKey: string | undefined
  export let last: boolean = false
  export let selected: boolean = false
  export let lastCat: boolean = false
  export let props: Record<string, any> = {}
  export let compactMode: boolean = false

  export function scroll (): void {
    elem?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
  }

  let elem: HTMLDivElement

  const dispatch = createEventDispatcher()

  export function getDoc (): Doc<Space> {
    return docObject
  }

  export function getElement (): HTMLDivElement {
    return elem
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getProps (props: Record<string, any>, _readonly: boolean): Record<string, any> {
    // Always set readonly to true
    return {
      ...props,
      readonly: true,
      editable: false,
      isEditable: false
    }
  }

  $: mobile = $deviceInfo.isMobile
  $: needCompact =
    model.filter((m) => ((m.displayProps?.optional) === true) || ((m.displayProps?.compression) === true) || m.displayProps?.suffix).length > 0

  onMount(() => {
    dispatch('on-mount')
  })
  let minWidth: number | undefined = undefined
  const sizes = new Map<number, number>()
  const calcSizes = (): void => {
    minWidth = sizes.size > 0 ? Array.from(sizes.values()).reduce((a, b) => a + b, 0) : undefined
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={elem}
  class="listGrid antiList__row row gap-2 flex-grow"
  class:compactMode
  class:last
  class:mListGridSelected={selected}
  class:lastCat
  on:contextmenu
  on:focus
  on:mouseenter
  on:mouseover
>
  <div class="flex-center relative mr-1" use:tooltip={{ label: view.string.Select, direction: 'bottom' }}>
    <div class="antiList-cells__notifyCell">
      <Component
        is={notification.component.NotificationPresenter}
        showLoading={false}
        props={{ value: docObject, kind: 'table' }}
      />
    </div>
  </div>
  {#each model.filter((p) => !(p.displayProps?.optional === true || p.displayProps?.compression === true || p.displayProps?.suffix === true)) as attributeModel, i}
    {@const displayProps = attributeModel.displayProps}
    {#if groupByKey === undefined || displayProps?.excludeByKey !== groupByKey}
      {#if displayProps?.grow}
        {#if !(compactMode && mobile)}
          {#each model.filter((p) => p.displayProps?.suffix === true) as attrModel}
            <ListPresenter
              {docObject}
              attributeModel={attrModel}
              props={getProps(props, $restrictionStore.readonly)}
              {compactMode}
              value={getObjectValue(attrModel.key, docObject)}
            />
          {/each}
        {/if}
        <GrowPresenter />
        {#if !compactMode}
          <div class="compression-bar" style:min-width={`${minWidth}px`}>
            {#each model.filter((p) => p.displayProps?.compression === true) as attrModel, index}
              <ListPresenter
                {docObject}
                attributeModel={attrModel}
                props={getProps(props, $restrictionStore.readonly)}
                value={getObjectValue(attrModel.key, docObject)}
                on:resize={(e) => {
                  if (e.detail == null) return
                  sizes.set(index, e.detail)
                  calcSizes()
                }}
              />
            {/each}
          </div>
          {#each model.filter((p) => p.displayProps?.optional === true) as attrModel}
            <ListPresenter
              {docObject}
              attributeModel={attrModel}
              props={getProps(props, $restrictionStore.readonly)}
              value={getObjectValue(attrModel.key, docObject)}
            />
          {/each}
        {/if}
      {:else}
        <ListPresenter
          {docObject}
          {attributeModel}
          props={getProps(props, $restrictionStore.readonly)}
          value={getObjectValue(attributeModel.key, docObject)}
          hideDivider={i === 0}
          {compactMode}
        />
      {/if}
    {/if}
  {/each}
  {#if compactMode && needCompact}
    <div class="panel-trigger" tabindex="-1">
      <IconCircles size={'small'} />
    </div>
    <div class="hidden-panel" tabindex="-1">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="header"
        on:click={(ev) => {
          ev.currentTarget.blur()
        }}
      >
        <IconCircles size={'small'} />
      </div>
      <div class="scroll-box gap-2">
        {#if mobile}
          {#each model.filter((p) => p.displayProps?.suffix === true) as attrModel}
            <ListPresenter
              {docObject}
              attributeModel={attrModel}
              props={getProps(props, $restrictionStore.readonly)}
              {compactMode}
              value={getObjectValue(attrModel.key, docObject)}
            />
          {/each}
        {/if}
        <div class="compression-bar">
          {#each model.filter((m) => m.displayProps?.compression) as attributeModel, j}
            {@const displayProps = attributeModel.displayProps}
            {@const value = getObjectValue(attributeModel.key, docObject)}
            {#if displayProps?.excludeByKey !== groupByKey && value !== undefined}
              <ListPresenter
                {docObject}
                {attributeModel}
                props={getProps(props, $restrictionStore.readonly)}
                value={getObjectValue(attributeModel.key, docObject)}
                hideDivider={j === 0}
              />
            {/if}
          {/each}
        </div>
        {#each model.filter((m) => m.displayProps?.optional) as attributeModel, j}
          {#if j === 0}
            <GrowPresenter />
          {/if}
          {@const displayProps = attributeModel.displayProps}
          {@const value = getObjectValue(attributeModel.key, docObject)}
          {#if displayProps?.excludeByKey !== groupByKey && value !== undefined}
            <ListPresenter
              {docObject}
              {attributeModel}
              props={getProps(props, $restrictionStore.readonly)}
              value={getObjectValue(attributeModel.key, docObject)}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .row {
    border-left: 1px solid var(--theme-list-border-color);
    border-right: 1px solid var(--theme-list-border-color);
  }
  .row:not(.lastCat, .last) {
    border-bottom: 1px solid var(--theme-divider-color);
  }
  .row.last {
    border-bottom: 1px solid var(--theme-list-subheader-divider);
  }
  .row.lastCat {
    border-radius: 0 0 0.25rem 0.25rem;
    border-bottom: 1px solid var(--theme-list-border-color);
  }

  /* Global styles in components.scss */
  .listGrid {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 2.5rem 0 0.25rem;
    width: 100%;
    height: 2.75rem;
    min-height: 2.75rem;
    color: var(--theme-caption-color);
    background-color: var(--theme-list-row-color);

    &.compactMode {
      padding: 0 1.125rem 0 0.25rem;
    }

    .hidden-panel,
    .panel-trigger {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0;
      bottom: 0;
      height: 100%;
    }
    .hidden-panel {
      overflow: hidden;
      right: 0;
      width: 80%;
      background-color: var(--theme-comp-header-color);
      opacity: 0;
      pointer-events: none;
      z-index: 2;
      transition-property: opacity, width;
      transition-duration: 0.15s;
      transition-timing-function: var(--timing-main);

      .header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0 0.25rem;
        width: 0.375rem;
        min-width: 0.375rem;
        height: 100%;
        opacity: 0.25;
      }
      .scroll-box {
        overflow-x: auto;
        overflow-y: visible;
        display: flex;
        align-items: center;
        margin: 0.125rem 0.25rem 0;
        padding: 0.25rem 0.25rem;
        min-width: 0;

        &::-webkit-scrollbar:horizontal {
          height: 3px;
        }
      }
    }
    .panel-trigger {
      flex-direction: column;
      justify-content: center;
      padding: 0 0.125rem;
      right: 0.125rem;
      width: 0.75rem;
      border: 1px solid transparent;
      border-radius: 0.25rem;
      opacity: 0.1;
      z-index: 1;
      transition: opacity 0.15s var(--timing-main);

      &:focus {
        border-color: var(--primary-edit-border-color);
        opacity: 0.25;
      }
    }
    .hidden-panel:focus-within,
    .hidden-panel:focus,
    .panel-trigger:focus + .hidden-panel {
      width: 100%;
      opacity: 1;
      pointer-events: all;
    }
  }
</style>
