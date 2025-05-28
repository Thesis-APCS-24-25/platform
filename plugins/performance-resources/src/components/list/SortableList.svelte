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
  import { Class, Doc, DocumentQuery, FindOptions, FindResult, Ref } from '@hcengineering/core'
  import { Asset, getResource, IntlString } from '@hcengineering/platform'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { Icon, IconSize, Label, Loading } from '@hcengineering/ui'
  import { getListItemPresenter, getObjectPresenter } from '@hcengineering/view-resources'
  import { SvelteComponent } from 'svelte'

  export let _class: Ref<Class<Doc>>
  export let label: IntlString | undefined = undefined
  export let query: DocumentQuery<Doc> = {}
  export let queryOptions: FindOptions<Doc> | undefined = undefined
  export let presenterProps: Record<string, any> = {}
  export let direction: 'row' | 'column' = 'column'
  // export let flipDuration = 200
  // export let isAddButtonHidden = true // Force hide add button
  // export let isAddButtonDisabled = true // Force disable add button
  export let itemsCount = 0
  export let icon: Asset | undefined = undefined
  export let iconSize: IconSize = 'small'

  const client = getClient()
  const itemsQuery = createQuery()

  let isPresenterLoading = false
  let areItemsloading = true

  let presenter: typeof SvelteComponent | undefined
  let items: FindResult<Doc> | undefined

  async function updatePresenter (classRef: Ref<Class<Doc>>): Promise<void> {
    try {
      isPresenterLoading = true

      const listItemPresenter = await getListItemPresenter(client, classRef)
      if (listItemPresenter !== undefined) {
        presenter = await getResource(listItemPresenter)
        return
      }

      const objectModel = await getObjectPresenter(client, classRef, { key: '' })
      if (objectModel?.presenter !== undefined) {
        presenter = objectModel.presenter
      }
    } finally {
      isPresenterLoading = false
    }
  }

  function updateItems (newItems: FindResult<Doc>): void {
    items = newItems
    areItemsloading = false
  }

  $: void (!$$slots.object && updatePresenter(_class))
  $: itemsQuery.query(_class, query, updateItems, {
    ...(queryOptions ?? {}),
    limit: Math.max(queryOptions?.limit ?? 0, 200)
  })

  $: isLoading = isPresenterLoading || areItemsloading
  $: itemsCount = items?.length ?? 0
</script>

<div class="flex-col">
  {#if label !== undefined}
    <div class="flex mb-4">
      {#if icon}
        <div class="mr-2 flex-center">
          <Icon {icon} size={iconSize} />
        </div>
      {/if}
      {#if label}
        <div class="title-wrapper">
          <span class="wrapped-title text-base caption-color">
            <Label {label} />
          </span>
        </div>
      {/if}
    </div>
  {/if}

  {#if isLoading}
    <Loading />
  {:else if ($$slots.object ?? presenter) && items}
    {@const isVertical = direction === 'column'}
    <div class="flex-gap-1" class:flex-col={isVertical} class:flex={!isVertical} class:flex-wrap={!isVertical}>
      {#each items as item (item._id) }
        <div class="item" class:column={isVertical} class:row={!isVertical}>
          {#if $$slots.object}
            <slot name="object" value={item} isDraggable={false} />
          {:else if presenter}
            <svelte:component this={presenter} isDraggable={false} {...presenterProps} value={item} />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .item {
    position: relative;
  }
</style>
