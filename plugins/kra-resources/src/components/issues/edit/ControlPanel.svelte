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
  import { PersonAccount } from '@hcengineering/contact'
  import { EmployeeBox, personAccountByIdStore, personByIdStore } from '@hcengineering/contact-resources'
  import core, { Class, ClassifierKind, Doc, Mixin, Ref } from '@hcengineering/core'
  import { AttributeBarEditor, createQuery, getClient, KeyedAttribute } from '@hcengineering/presentation'

  import tags from '@hcengineering/tags'
  import type { Issue } from '@hcengineering/kra'
  import { Component, Label } from '@hcengineering/ui'
  import { getFiltredKeys, isCollectionAttr, ObjectBox, restrictionStore } from '@hcengineering/view-resources'
  import tracker from '../../../plugin'
  import AssigneeEditor from '../AssigneeEditor.svelte'
  import DueDateEditor from '../DueDateEditor.svelte'
  import PriorityEditor from '../PriorityEditor.svelte'
  import RelationEditor from '../RelationEditor.svelte'
  import StatusEditor from '../StatusEditor.svelte'

  export let issue: Issue
  export let showAllMixins: boolean = false
  export let readonly = false

  const query = createQuery()
  let showIsBlocking = false
  let blockedBy: Doc[]
  $: query.query(tracker.class.Issue, { blockedBy: { _id: issue._id, _class: issue._class } }, (result) => {
    blockedBy = result
    showIsBlocking = result.length > 0
  })

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const ignoreKeys = [
    'title',
    'description',
    'priority',
    'status',
    'number',
    'assignee',
    'component',
    'milestone',
    'relations',
    'blockedBy',
    'identifier',
    'goal',
    'estimation',
    'reportedTime',
    'remainingTime',
    'progress'
  ]

  let keys: KeyedAttribute[] = []

  function sortStartDateAndDueDate (keys: KeyedAttribute[]): KeyedAttribute[] {
    let startIndex: number | undefined
    let dueIndex: number | undefined

    for (const [i, key] of keys.entries()) {
      if (key.key === 'startDate') startIndex = i
      else if (key.key === 'dueDate') dueIndex = i
    }
    if (startIndex === undefined || dueIndex === undefined || startIndex < dueIndex) return keys
    const temp = keys[startIndex]
    keys[startIndex] = keys[dueIndex]
    keys[dueIndex] = temp
    return keys
  }

  function updateKeys (_class: Ref<Class<Issue>>, ignoreKeys: string[]): void {
    const filtredKeys = getFiltredKeys(hierarchy, _class, ignoreKeys)
    keys = filtredKeys.filter((key) => !isCollectionAttr(hierarchy, key))
    keys = sortStartDateAndDueDate(keys)
  }

  let mixins: Mixin<Doc>[] = []

  $: getMixins(issue, showAllMixins)

  function getMixins (object: Issue, showAllMixins: boolean): void {
    const descendants = hierarchy.getDescendants(core.class.Doc).map((p) => hierarchy.getClass(p))

    mixins = descendants.filter(
      (m) =>
        m.kind === ClassifierKind.MIXIN &&
        (hierarchy.hasMixin(object, m._id) ||
          (showAllMixins && hierarchy.isDerived(tracker.class.Issue, hierarchy.getBaseClass(m._id))))
    )
  }

  function getMixinKeys (mixin: Ref<Mixin<Doc>>): KeyedAttribute[] {
    const mixinClass = hierarchy.getClass(mixin)
    const filtredKeys = getFiltredKeys(
      hierarchy,
      mixin,
      [],
      hierarchy.isMixin(mixinClass.extends as Ref<Class<Doc>>) ? mixinClass.extends : issue._class
    )
    return filtredKeys.filter((key) => !isCollectionAttr(hierarchy, key))
  }

  $: updateKeys(issue._class, ignoreKeys)

  let account: PersonAccount | undefined

  $: account = $personAccountByIdStore.get(issue.createdBy as Ref<PersonAccount>)
  $: employee = account && $personByIdStore.get(account.person)
</script>

<div class="popupPanel-body__aside-grid">
  {#if issue.template?.template}
    <span class="labelOnPanel">
      <Label label={tracker.string.IssueTemplate} />
    </span>
    <ObjectBox
      _class={tracker.class.IssueTemplate}
      value={issue.template?.template}
      size={'small'}
      kind={'link'}
      width={'100%'}
      label={tracker.string.NoIssueTemplate}
      icon={tracker.icon.Issues}
      searchField={'title'}
      allowDeselect={true}
      showNavigate={false}
      readonly
      docProps={{ disabled: true }}
    />
  {/if}

  <span class="labelOnPanel">
    <Label label={tracker.string.Status} />
  </span>

  <StatusEditor value={issue} size={'medium'} iconSize={'small'} shouldShowLabel isEditable={!readonly} />

  {#if issue.blockedBy?.length}
    <span class="labelTop">
      <Label label={tracker.string.BlockedBy} />
    </span>
    <RelationEditor value={issue} type="blockedBy" {readonly} disabled={$restrictionStore.disableNavigation} />
  {/if}
  {#if showIsBlocking}
    <span class="labelTop">
      <Label label={tracker.string.Blocks} />
    </span>
    <RelationEditor
      value={issue}
      type="isBlocking"
      {blockedBy}
      {readonly}
      disabled={$restrictionStore.disableNavigation}
    />
  {/if}
  {#if issue.relations?.length}
    <span class="labelTop">
      <Label label={tracker.string.Related} />
    </span>
    <RelationEditor value={issue} type="relations" {readonly} disabled={$restrictionStore.disableNavigation} />
  {/if}

  <span class="labelOnPanel">
    <Label label={tracker.string.Priority} />
  </span>
  <PriorityEditor value={issue} size={'medium'} shouldShowLabel isEditable={!readonly} width={'100%'} />

  <span class="labelOnPanel">
    <Label label={core.string.CreatedBy} />
  </span>
  <EmployeeBox
    value={employee?._id}
    label={core.string.CreatedBy}
    kind={'link'}
    size={'medium'}
    avatarSize={'card'}
    width={'100%'}
    showNavigate={false}
    readonly
  />

  <span class="labelOnPanel">
    <Label label={tracker.string.Assignee} />
  </span>
  <AssigneeEditor object={issue} size={'medium'} avatarSize={'card'} width="100%" {readonly} />

  <span class="labelTop">
    <Label label={tracker.string.Labels} />
  </span>
  <Component
    is={tags.component.TagsAttributeEditor}
    props={{ object: issue, label: tracker.string.AddLabel, readonly }}
  />

  <!-- {#if issue.dueDate !== null}
    <div class="divider" />

    <span class="labelOnPanel">
      <Label label={tracker.string.DueDate} />
    </span>
    <DueDateEditor value={issue} width={'100%'} editable={!readonly} />
  {/if} -->

  {#if keys.length > 0}
    <div class="divider" />
    {#each keys as key (typeof key === 'string' ? key : key.key)}
      <AttributeBarEditor
        {readonly}
        {key}
        identifier={issue.identifier}
        _class={issue._class}
        object={issue}
        showHeader={true}
        size={'medium'}
      />
    {/each}
  {/if}

  {#each mixins as mixin}
    {@const mixinKeys = getMixinKeys(mixin._id)}
    {#if mixinKeys.length}
      <div class="divider" />
      {#each mixinKeys as key (typeof key === 'string' ? key : key.key)}
        <AttributeBarEditor
          {key}
          identifier={issue.identifier}
          _class={mixin._id}
          {readonly}
          object={hierarchy.as(issue, mixin._id)}
          showHeader={true}
          size={'medium'}
        />
      {/each}
    {/if}
  {/each}
</div>
