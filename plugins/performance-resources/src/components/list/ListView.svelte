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
  import { Class, Doc, DocumentQuery, FindOptions, Ref, Space } from '@hcengineering/core'
  import { ActionContext } from '@hcengineering/presentation'
  import { Scroller, resizeObserver } from '@hcengineering/ui'
  import { BuildModelKey, ViewOptionModel, ViewOptions, Viewlet } from '@hcengineering/view'
  import { onMount } from 'svelte'
  import { ListSelectionProvider, SelectDirection } from '@hcengineering/view-resources'

  import List from './List.svelte'

  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space> | undefined = undefined
  export let query: DocumentQuery<Doc> = {}
  export let options: FindOptions<Doc> | undefined = undefined
  export let viewlet: Viewlet
  export let config: Array<string | BuildModelKey>

  // Per _class configuration, if supported.
  export let configurations: Record<Ref<Class<Doc>>, Viewlet['config']> | undefined
  export let viewOptions: ViewOptions
  export let viewOptionsConfig: ViewOptionModel[] | undefined = undefined
  export let props: Record<string, any> = {}

  let list: List
  let scroll: Scroller
  let divScroll: HTMLDivElement
  let listWidth: number = 0

  const listProvider = new ListSelectionProvider(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (offset: 1 | -1 | 0, of?: Doc, dir?: SelectDirection, noScroll?: boolean) => {}
  )

  onMount(() => {
    ;(document.activeElement as HTMLElement)?.blur()
  })
</script>

<ActionContext
  context={{
    mode: 'browser'
  }}
/>
<div
  use:resizeObserver={(evt) => {
    listWidth = evt.clientWidth
  }}
  class="w-full h-full py-4 clear-mins"
>
  <Scroller
    bind:this={scroll}
    bind:divScroll
    fade={{ multipler: { top: 2.75 * viewOptions.groupBy.length, bottom: 0 } }}
    padding={'0 1rem'}
    noFade
    checkForHeaders
  >
    <List
      bind:this={list}
      {_class}
      {space}
      {query}
      {config}
      {configurations}
      {options}
      {viewOptions}
      props={{
        ...viewlet.props,
        ...props
      }}
      {listProvider}
      compactMode={listWidth <= 800}
      viewOptionsConfig={viewOptionsConfig ?? viewlet.viewOptions?.other}
      on:row-focus={(event) => {
        listProvider.updateFocus(event.detail ?? undefined)
      }}
      on:content={(event) => {
        listProvider.update(event.detail)
      }}
      on:collapsed={(event) => {
        if (divScroll.getBoundingClientRect().top > event.detail.div.getBoundingClientRect().top) {
          event.detail.div.scrollIntoView(true)
        }
      }}
    />
  </Scroller>
</div>
