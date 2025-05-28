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
    CategoryType,
    Class,
    Doc,
    DocumentQuery,
    FindOptions,
    generateId,
    Lookup,
    RateLimiter,
    Ref,
    Space
  } from '@hcengineering/core'
  import { getResource } from '@hcengineering/platform'
  import { getClient, reduceCalls } from '@hcengineering/presentation'
  import {
    AttributeModel,
    BuildModelKey,
    CategoryOption,
    Viewlet,
    ViewOptionModel,
    ViewOptions
  } from '@hcengineering/view'
  import { onDestroy, SvelteComponentTyped } from 'svelte'
  import {
    SelectionFocusProvider,
    buildModel,
    concatCategories,
    fixedWidthStore,
    getAdditionalHeader,
    getCategories,
    getGroupByValues,
    getPresenter,
    groupBy, CategoryQuery, noCategory
  } from '@hcengineering/view-resources'
  import ListCategory from './ListCategory.svelte'

  export let docs: Doc[]
  export let docKeys: Partial<DocumentQuery<Doc>> = {}
  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space> | undefined
  export let query: DocumentQuery<Doc> | undefined
  export let lookup: Lookup<Doc>
  export let baseMenuClass: Ref<Class<Doc>> | undefined
  export let config: Array<string | BuildModelKey>
  export let configurations: Record<Ref<Class<Doc>>, Viewlet['config']> | undefined
  export let viewOptions: ViewOptions
  export let flatHeaders = false
  export let disableHeader = false
  export let props: Record<string, any> = {}
  export let level: number
  export let initIndex = 0
  export let newObjectProps: (doc: Doc | undefined) => Record<string, any> | undefined
  export let viewOptionsConfig: ViewOptionModel[] | undefined = undefined
  export let listDiv: HTMLDivElement
  export let groupPersistKey: string
  export let compactMode: boolean = false

  export let resultQuery: DocumentQuery<Doc>
  export let resultOptions: FindOptions<Doc>
  export let limiter: RateLimiter
  export let listProvider: SelectionFocusProvider

  $: groupByKey = viewOptions.groupBy[level] ?? noCategory
  let categories: CategoryType[] = []

  const updateCategories = reduceCalls(
    async (
      _class: Ref<Class<Doc>>,
      space: Ref<Space> | undefined,
      docs: Doc[],
      groupByKey: string,
      viewOptions: ViewOptions,
      viewOptionsModel: ViewOptionModel[] | undefined
    ): Promise<void> => {
      categories = await getCategories(client, _class, space, docs, groupByKey)
      if (level === 0) {
        for (const viewOption of viewOptionsModel ?? []) {
          if (viewOption.actionTarget !== 'category') continue
          const categoryFunc = viewOption as CategoryOption
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (viewOptions[viewOption.key] ?? viewOption.defaultValue) {
            const f = await getResource(categoryFunc.action)
            const res = hierarchy.clone(await f(_class, query, space, groupByKey, update, queryId))
            if (res !== undefined) {
              categories = concatCategories(res, categories)
              return
            }
          }
        }
      }
    }
  )

  $: void updateCategories(_class, space, docs, groupByKey, viewOptions, viewOptionsConfig)

  $: groupByDocs = groupBy(docs, groupByKey, categories)

  const client = getClient()
  const hierarchy = client.getHierarchy()

  const queryId = generateId()
  onDestroy(() => {
    CategoryQuery.remove(queryId)
  })

  function update (): void {
    void updateCategories(_class, space, docs, groupByKey, viewOptions, viewOptionsConfig)
  }

  let itemModels = new Map<Ref<Class<Doc>>, AttributeModel[]>()

  const getHeader = reduceCalls(async function (_class: Ref<Class<Doc>>, groupByKey: string): Promise<void> {
    if (groupByKey === noCategory) {
      headerComponent = undefined
    } else {
      await getPresenter(client, _class, { key: groupByKey }, { key: groupByKey }).then((p) => (headerComponent = p))
    }
  })

  let headerComponent: AttributeModel | undefined
  $: void getHeader(_class, groupByKey)

  let configurationsVersion = 0
  const buildModels = reduceCalls(async function (
    _class: Ref<Class<Doc>>,
    config: Array<string | BuildModelKey>,
    configurations?: Record<Ref<Class<Doc>>, Viewlet['config']> | undefined
  ): Promise<void> {
    const newItemModels = new Map<Ref<Class<Doc>>, AttributeModel[]>()
    const entries = Object.entries(configurations ?? [])
    for (const [k, v] of entries) {
      const _cl = k as Ref<Class<Doc>>
      const res = await buildModel({ client, _class: _cl, keys: v, lookup })
      newItemModels.set(_cl, res)
    }

    if (!newItemModels.has(_class)) {
      const res = await buildModel({ client, _class, keys: config, lookup })
      newItemModels.set(_class, res)
    }

    itemModels = newItemModels
    for (const [, v] of Object.entries(newItemModels)) {
      // itemModels = itemModels
      ;(v as AttributeModel[]).forEach((m: AttributeModel) => {
        if (m.displayProps?.key !== undefined) {
          const key = `list_item_${m.displayProps.key}`
          if (m.displayProps.fixed !== undefined) {
            $fixedWidthStore[key] = 0
          }
        }
      })
    }
    configurationsVersion = configurationsVersion + 1
  })

  $: void buildModels(_class, config, configurations)

  // function getInitIndex (categories: any, i: number): number {
  //   let res = initIndex
  //   for (let index = 0; index < i; index++) {
  //     const cat = categories[index]
  //     res += groupByDocs[cat]?.length ?? 0
  //   }
  //   return res
  // }

  $: extraHeaders = getAdditionalHeader(client, _class)

  const listCategory: SvelteComponentTyped[] = []
  const listListCategory: ListCategory[] = []
  function getGroupByKey (
    docKeys: Partial<DocumentQuery<Doc<Space>>>,
    category: CategoryType,
    resultQuery: DocumentQuery<Doc<Space>>
  ): Partial<DocumentQuery<Doc>> {
    return {
      ...docKeys,
      [groupByKey]:
        typeof category === 'object'
          ? category.name !== undefined
            ? { $in: category.values.flatMap((x) => x._id) }
            : resultQuery[groupByKey]?.$in?.length !== 0
              ? undefined
              : []
          : category
    }
  }
</script>

{#each categories as category, i (typeof category === 'object' ? category.name : category)}
  {@const items = groupByKey === noCategory ? docs : getGroupByValues(groupByDocs, category)}
  {@const categoryDocKeys = getGroupByKey(docKeys, category, resultQuery)}
  <ListCategory
    bind:this={listListCategory[i]}
    {extraHeaders}
    {space}
    {headerComponent}
    {baseMenuClass}
    {level}
    {viewOptions}
    {groupByKey}
    {lookup}
    {config}
    {configurations}
    {configurationsVersion}
    {itemModels}
    {_class}
    parentCategories={categories.length}
    groupPersistKey={`${groupPersistKey}_${level}_${typeof category === 'object' ? category.name : category}`}
    singleCat={level === 0 && categories.length === 1}
    oneCat={viewOptions.groupBy.length === 1}
    lastCat={i === categories.length - 1}
    {category}
    itemProj={items}
    docKeys={categoryDocKeys}
    {newObjectProps}
    {viewOptionsConfig}
    {compactMode}
    {resultQuery}
    {resultOptions}
    {limiter}
    on:row-focus
    on:collapsed
    {flatHeaders}
    {disableHeader}
    {props}
    {listDiv}
  >
    <svelte:fragment
      slot="category"
      let:docs
      let:_class
      let:space
      let:lookup
      let:baseMenuClass
      let:config
      let:viewOptions
      let:newObjectProps
      let:flatHeaders
      let:props
      let:level
      let:viewOptionsConfig
      let:listDiv
    >
      <svelte:self
        {docs}
        bind:this={listCategory[i]}
        {_class}
        {space}
        {lookup}
        {baseMenuClass}
        {config}
        {viewOptions}
        {newObjectProps}
        {flatHeaders}
        {props}
        {level}
        docKeys={categoryDocKeys}
        groupPersistKey={`${groupPersistKey}_${level}_${typeof category === 'object' ? category.name : category}`}
        {initIndex}
        {viewOptionsConfig}
        {listDiv}
        {resultQuery}
        {resultOptions}
        {limiter}
        {listProvider}
        on:row-focus
      />
    </svelte:fragment>
  </ListCategory>
{/each}
