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
  import {
    AggregateValue,
    Class,
    Doc,
    DocumentQuery,
    FindOptions,
    Hierarchy,
    Lookup,
    PrimitiveType,
    RateLimiter,
    Ref,
    Space
  } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { AnyComponent, ExpandCollapse, mouseAttractor } from '@hcengineering/ui'
  import { AttributeModel, BuildModelKey, ViewOptionModel, ViewOptions, Viewlet } from '@hcengineering/view'
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { showMenu, FocusSelection, SelectionFocusProvider, focusStore } from '@hcengineering/view-resources'
  import ListHeader from './ListHeader.svelte'
  import ListItem from './ListItem.svelte'

  export let category: PrimitiveType | AggregateValue
  export let headerComponent: AttributeModel | undefined
  export let singleCat: boolean
  export let oneCat: boolean
  export let lastCat: boolean
  export let groupByKey: string
  export let space: Ref<Space> | undefined
  export let baseMenuClass: Ref<Class<Doc>> | undefined
  export let itemProj: Doc[]
  export let docKeys: Partial<DocumentQuery<Doc>> = {}
  export let selectedObjectIds: Doc[]
  export let itemModels: Map<Ref<Class<Doc>>, AttributeModel[]>
  export let extraHeaders: AnyComponent[] | undefined
  export let flatHeaders = false
  export let disableHeader = false
  export let props: Record<string, any> = {}
  export let level: number
  export let lookup: Lookup<Doc>
  export let _class: Ref<Class<Doc>>
  export let config: Array<string | BuildModelKey>
  export let configurations: Record<Ref<Class<Doc>>, Viewlet['config']> | undefined
  export let configurationsVersion: number
  export let viewOptions: ViewOptions
  export let newObjectProps: (doc: Doc | undefined) => Record<string, any> | undefined
  export let viewOptionsConfig: ViewOptionModel[] | undefined = undefined
  export let listDiv: HTMLDivElement
  export let groupPersistKey: string
  export let compactMode: boolean = false
  export let resultQuery: DocumentQuery<Doc>
  export let resultOptions: FindOptions<Doc>
  export let parentCategories: number = 0
  export let limiter: RateLimiter
  export let listProvider: SelectionFocusProvider

  $: lastLevel = level + 1 >= viewOptions.groupBy.length

  let items: Doc[] = []

  const docsQuery = createQuery()

  const autoFoldLimit = 20
  const defaultLimit = 20
  const singleCategoryLimit = 50
  let loading = false
  $: initialLimit = !lastLevel ? undefined : singleCat ? singleCategoryLimit : defaultLimit
  $: limit = initialLimit

  $: selection = $focusStore.provider?.selection

  let selectedMatch: Array<Ref<Doc>> = []

  $: if (itemProj !== undefined && itemProj.length > 0 && $selection !== undefined && $selection.length > 0) {
    // update limit if we have selected items.
    const prj = new Set(itemProj.map((it) => it._id))
    selectedMatch = $selection.filter((it) => prj.has(it._id)).map((it) => it._id)
    if (selectedMatch.length > (limit ?? 0)) {
      limit = (limit ?? 0) + selectedMatch.length
    }
  }

  function noSearch (query: DocumentQuery<Doc>): DocumentQuery<Doc> {
    const result = query
    if ('$search' in result) {
      delete result.$search
    }
    return result
  }

  $: finalResultQuery =
    itemProj.length < 20 && resultQuery.$search !== null
      ? noSearch({
        ...resultQuery,
        _id: { $in: itemProj.map((it) => it._id) }
      })
      : resultQuery

  $: if (lastLevel) {
    void limiter.add(async () => {
      try {
        loading = docsQuery.query(
          _class,
          { ...finalResultQuery, ...docKeys },
          (res) => {
            items = res
            loading = false
            const focusDoc = items.find((it) => it._id === $focusStore.focus?._id)
            if (focusDoc !== undefined) {
              handleRowFocused(focusDoc)
            }
          },
          { ...resultOptions, limit: limit ?? 200 }
        )
      } catch (e) {
        console.error(e)
        loading = false
      }
    })
  } else {
    docsQuery.unsubscribe()
  }

  $: categoryCollapseKey = `list_collapsing_${location.pathname}_${groupPersistKey}`
  $: storedCollapseState = localStorage.getItem(categoryCollapseKey)

  $: collapsed = storedCollapseState === 'true' || storedCollapseState === null
  let wasLoaded = false

  const dispatch = createEventDispatcher()

  function limitGroup (items: Doc[], limit: number | undefined): Doc[] {
    const res = limit !== undefined ? items.slice(0, limit) : items
    return res
  }

  function initCollapsed (singleCat: boolean, lastLevel: boolean, level: number): void {
    if (localStorage.getItem(categoryCollapseKey) === null) {
      collapsed =
        (!disableHeader &&
          !singleCat &&
          itemProj.length > (lastLevel ? autoFoldLimit : singleCategoryLimit) / (level + 1)) ||
        parentCategories > 10 ||
        (level > 1 && parentCategories > 5)
    }
  }

  $: initCollapsed(singleCat, lastLevel, level)

  const handleRowFocused = (object: Doc): void => {
    dispatch('row-focus', object)
  }

  $: limited = limitGroup(items, limit)

  $: selectedObjectIdsSet = new Set<Ref<Doc>>(selectedObjectIds.map((it) => it._id))

  const handleMenuOpened = async (event: MouseEvent, object: Doc): Promise<void> => {
    handleRowFocused(object)

    if (!selectedObjectIdsSet.has(object._id)) {
      dispatch('uncheckAll')
    }

    const items = selectedObjectIds.length > 0 ? selectedObjectIds : object
    showMenu(event, { object: items, baseMenuClass })
  }

  function isSelected (doc: Doc, focusStore: FocusSelection): boolean {
    return focusStore.focus?._id === doc._id
  }

  // $: byRank = viewOptions.orderBy?.[0] === 'rank'

  const client = getClient()

  let div: HTMLDivElement

  export function expand (): void {
    collapsed = false
    localStorage.setItem(categoryCollapseKey, 'false')
  }
  export function scroll (item: Doc): void {
    const pos = limited.findIndex((it) => it._id === item._id)
    if (pos >= 0) {
      if (collapsed) {
        collapsed = false
        localStorage.setItem(categoryCollapseKey, 'false')
        setTimeout(() => {
          scroll(item)
        }, 50)
      } else {
        listItems[pos]?.scroll()
      }
    }
  }

  export function getLimited (): Doc[] {
    return limited
  }

  const listItems: ListItem[] = []

  function getDocItemModel (docClass: Ref<Class<Doc>>): AttributeModel[] {
    let res = itemModels.get(docClass)
    if (res !== undefined) {
      return res
    }

    try {
      for (const ac of client.getHierarchy().getAncestors(docClass)) {
        res = itemModels.get(ac)

        if (res !== undefined) {
          return res
        }
      }
    } catch (e) {
      // suppress
    }

    return []
  }
</script>

<div
  in:fade|local={{ duration: 50 }}
  bind:this={div}
  class="category-container"
  class:zero-container={level === 0}
>
  {#if !disableHeader}
    <ListHeader
      {groupByKey}
      {category}
      {space}
      {level}
      limited={lastLevel ? limited.length : itemProj.length}
      itemsProj={itemProj}
      items={limited}
      {listProvider}
      {headerComponent}
      {extraHeaders}
      flat={flatHeaders}
      {collapsed}
      {props}
      {lastCat}
      {viewOptions}
      {loading}
      on:more={() => {
        if (limit !== undefined) limit += 20
      }}
      on:collapse={() => {
        collapsed = !collapsed
        if (collapsed) {
          if ($focusStore.focus !== undefined) {
            const fid = $focusStore.focus._id
            if (items.some((it) => it._id === fid)) {
              $focusStore = { provider: $focusStore.provider }
            }
          }
          dispatch('collapsed', { div })
        }
        localStorage.setItem(categoryCollapseKey, collapsed ? 'true' : 'false')
      }}
    />
  {/if}
  <ExpandCollapse isExpanded={!collapsed}>
    {#if !lastLevel}
      <slot
        name="category"
        docs={itemProj}
        {_class}
        {space}
        {lookup}
        {baseMenuClass}
        {config}
        {configurations}
        {selectedObjectIds}
        {viewOptions}
        {docKeys}
        newObjectProps={newObjectProps}
        {flatHeaders}
        {props}
        level={level + 1}
        {groupPersistKey}
        {viewOptionsConfig}
        {listDiv}
      />
    {:else if itemModels != null && itemModels.size > 0 && (!collapsed || wasLoaded)}
      {#if limited}
        {#key configurationsVersion}
          {#each limited as docObject, i (docObject._id)}
            <ListItem
              bind:this={listItems[i]}
              {docObject}
              model={getDocItemModel(Hierarchy.mixinOrClass(docObject))}
              {groupByKey}
              selected={isSelected(docObject, $focusStore)}
              checked={selectedObjectIdsSet.has(docObject._id)}
              last={i === limited.length - 1}
              lastCat={i === limited.length - 1 && (oneCat || lastCat)}
              on:check={(ev) => dispatch('check', { docs: ev.detail.docs, value: ev.detail.value })}
              on:contextmenu={async (event) => {
                await handleMenuOpened(event, docObject)
              }}
              on:focus={() => {}}
              on:mouseover={mouseAttractor(() => {
                handleRowFocused(docObject)
              })}
              on:mouseenter={mouseAttractor(() => {
                handleRowFocused(docObject)
              })}
              {props}
              {compactMode}
              on:on-mount={() => {
                wasLoaded = true
              }}
            />
          {/each}
        {/key}
      {/if}
    {/if}
  </ExpandCollapse>
</div>

<style lang="scss">
  .zero-container {
    border-radius: 0.25rem;

    &:not(:first-child) {
      margin-top: 0.5rem;
    }
  }
</style>
