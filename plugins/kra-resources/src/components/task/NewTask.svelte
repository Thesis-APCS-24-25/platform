<script lang="ts">
  import {
    Card,
    createMarkup,
    createQuery,
    DocCreateExtensionManager,
    DraftController,
    getClient,
    MessageBox,
    MultipleDraftController,
    getMarkup,
    DocCreateExtComponent,
    SpaceSelector
  } from '@hcengineering/presentation'
  import kra from '../../plugin'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { Component, EditBox, Label, showPopup } from '@hcengineering/ui'
  import { Group, Project, WeeTask, WeeTaskDraft } from '@hcengineering/kra'
  import { DocData, fillDefaults, generateId, makeCollabId, makeDocCollabId, Ref, SortingOrder } from '@hcengineering/core'
  import { EmptyMarkup, isEmptyMarkup } from '@hcengineering/text'
  import { Employee } from '@hcengineering/contact'
  import { makeRank, Task, TaskType } from '@hcengineering/task'
  import { AttachmentStyledBox } from '@hcengineering/attachment-resources'
  import core from '@hcengineering/core'
  import ProjectPresenter from '../project/ProjectPresenter.svelte'

  export let space: Ref<Group> | undefined
  export let assignee: Ref<Employee> | null = null
  export let shouldSaveDraft: boolean = true
  export let originalWeeTask: WeeTask | undefined

  const mDraftController = new MultipleDraftController(kra.ids.WeeTaskDraft)
  const id: Ref<WeeTask> = generateId()
  const draftController = new DraftController<WeeTaskDraft>(
    shouldSaveDraft ? mDraftController.getNext() ?? id : undefined,
    kra.ids.WeeTaskDraft
  )

  let draft = shouldSaveDraft ? draftController.get() : undefined

  let currentProject: Project | undefined

  onDestroy(
    draftController.subscribe((val) => {
      draft = shouldSaveDraft ? val : undefined
    })
  )
  const client = getClient()
  const hierarchy = client.getHierarchy()

  let _space = draft?.space ?? space
  // let project: Project | undefined
  let object = getDefaultObjectFromDraft() ?? getDefaultObject(id)
  let isAssigneeTouched = false
  let kind: Ref<TaskType> | undefined = undefined

  function objectChange(object: WeeTaskDraft, empty: any): void {
    if (shouldSaveDraft) {
      draftController.save(object, empty)
    }
  }

  function getDefaultObjectFromDraft(): WeeTaskDraft | undefined {
    if (draft == null) {
      return
    }

    return {
      ...draft
    }
  }

  function getDefaultObject(id: Ref<WeeTask> | undefined = undefined, ignoreOriginal = false): WeeTaskDraft {
    const base: WeeTaskDraft = {
      _id: id ?? generateId(),
      title: '',
      description: EmptyMarkup,
      kind: '' as Ref<TaskType>,
      space: _space as Ref<Group>,
      dueDate: null,
      assignee
    }
    if (originalWeeTask !== undefined && !ignoreOriginal) {
      const res: WeeTaskDraft = {
        ...base,
        status: originalWeeTask.status,
        dueDate: originalWeeTask.dueDate,
        title: `${originalWeeTask.title} (copy)`
      }
      void getMarkup(makeDocCollabId(originalWeeTask, 'description'), originalWeeTask.description).then((res) => {
        object.description = res
      })

      return res
    }
    return base
  }
  fillDefaults(hierarchy, object, kra.class.WeeTask)

  let currentGroup: Group | undefined

  let descriptionBox: AttachmentStyledBox | undefined

  $: canSave =
    descriptionBox != null &&
    getTitle(object.title ?? '').length > 0 &&
    object.status !== undefined &&
    kind !== undefined &&
    currentGroup !== undefined

  $: empty = {
    description: EmptyMarkup,
    space: _space
  }

  $: objectChange(object, empty)

  $: if (_space !== undefined && object.space !== _space) {
    object.space = _space
  }

  function resetObject(): void {
    object = getDefaultObject(undefined, true)
    fillDefaults(hierarchy, object, kra.class.WeeTask)
  }

  const dispatch = createEventDispatcher()
  const spaceQuery = createQuery()

  $: if (_space !== undefined) {
    spaceQuery.query(kra.class.Group, { _id: _space }, (res) => {
      currentGroup = res[0]
    })
  } else {
    currentGroup = undefined
  }

  const docCreateManager = DocCreateExtensionManager.create(kra.class.WeeTask)

  function getTitle(value: string): string {
    return value.trim()
  }

  export function canClose(): boolean {
    return true
  }

  export function onOutsideClick(): void {
    if (shouldSaveDraft) {
      draftController.save(object, empty)
    }
  }

  async function createTask(): Promise<void> {
    const _id: Ref<Task> = generateId()
    if (
      !canSave ||
      object.status === undefined ||
      _space === undefined ||
      kind === undefined ||
      currentGroup === undefined
    ) {
      return
    }

    // TODO: We need a measure client and mark all operations with it as measure under one root,
    // to prevent other operations to infer our measurement.
    try {
      const operations = client.apply(undefined, 'tracker.createIssue')

      const lastOne = await client.findOne<WeeTask>(
        kra.class.WeeTask,
        { space: _space },
        { sort: { rank: SortingOrder.Descending } }
      )
      const incResult = await client.updateDoc(
        kra.class.Group,
        core.space.Space,
        _space,
        {
          $inc: { taskSequence: 1 }
        },
        true
      )

      const number = (incResult as any).object.taskSequence

      const identifier = `${currentGroup?.taskIdentifier}-${number}`

      const value: DocData<WeeTask> = {
        title: getTitle(object.title),
        description: null,
        assignee: object.assignee,
        number,
        status: object.status,
        rank: makeRank(lastOne?.rank, undefined),
        comments: 0,
        dueDate: object.dueDate,
        kind,
        identifier
      }

      if (!isEmptyMarkup(object.description)) {
        const collabId = makeCollabId(kra.class.WeeTask, _id, 'description')
        value.description = await createMarkup(collabId, object.description)
      }

      await docCreateManager.commit(operations, _id, currentGroup, value, 'pre')

      await operations.addCollection(
        kra.class.WeeTask,
        _space,
        kra.ids.NoParent,
        kra.class.WeeTask,
        'subIssues',
        value,
        _id
      )

      await docCreateManager.commit(operations, _id, currentGroup, value, 'post')
      draftController.remove()
      descriptionBox?.removeDraft(false)
      isAssigneeTouched = false
      const d1 = Date.now()
    } catch (err: any) {
      resetObject()
      draftController.remove()
      descriptionBox?.removeDraft(false)
      console.error(err)
    }
  }

  async function showConfirmationDialog(): Promise<void> {
    draftController.save(object, empty)
    const isFormEmpty = draft === undefined

    if (isFormEmpty) {
      dispatch('close')
    } else {
      showPopup(
        MessageBox,
        {
          label: kra.string.NewWeeTaskDialogClose,
          message: kra.string.NewWeeTaskDialogCloseNote
        },
        'top',
        (result?: boolean) => {
          if (result === true) {
            dispatch('close')
            resetObject()
            draftController.remove()
            descriptionBox?.removeDraft(true)
          }
        }
      )
    }
  }

  // async function findDefaultSpace(): Promise<Project | undefined> {
  //   let targetRef: Ref<Project> | undefined
  //   if (relatedTo !== undefined) {
  //     const targets = await client.findAll(tracker.class.RelatedIssueTarget, {})
  //     // Find a space target first
  //     targetRef =
  //       targets.find((t) => t.rule.kind === 'spaceRule' && t.rule.space === relatedTo?.space && t.target !== undefined)
  //         ?.target ?? undefined
  //     // Find a class target as second
  //     targetRef =
  //       targetRef ??
  //       targets.find(
  //         (t) =>
  //           t.rule.kind === 'classRule' &&
  //           client.getHierarchy().isDerived(relatedTo?._class as Ref<Class<Doc>>, t.rule.ofClass)
  //       )?.target ??
  //       undefined
  //   }

  //   if (targetRef === undefined) {
  //     // Use last created issue in first.
  //     const projects = await client.findAll(
  //       tracker.class.ProjectTargetPreference,
  //       {},
  //       { sort: { usedOn: SortingOrder.Descending } }
  //     )
  //     if (projects.length > 0) {
  //       targetRef = projects[0]?.attachedTo
  //     }
  //   }

  //   // Find first starred project
  //   if (targetRef === undefined) {
  //     const prefs = await client.findAll<SpacePreference>(
  //       preference.class.SpacePreference,
  //       {},
  //       { sort: { modifiedOn: SortingOrder.Ascending } }
  //     )
  //     const projects = await client.findAll<Project>(tracker.class.Project, {
  //       _id: {
  //         $in: Array.from(prefs.map((it) => it.attachedTo as Ref<Project>).filter((it) => it != null))
  //       }
  //     })
  //     if (projects.length > 0) {
  //       return projects[0]
  //     }
  //   }

  //   if (targetRef !== undefined) {
  //     return await client.findOne(tracker.class.Project, { _id: targetRef })
  //   }
  // }

  async function findDefaultSpace() {
    return undefined
  }
  $: extraProps = {
    status: object.status,
    assignee: object.assignee
  }
</script>

<Card
  label={kra.string.NewTask}
  okAction={createTask}
  {canSave}
  on:close={() => dispatch('close')}
  headerNoPadding
  noFade={true}
  on:changeContent
>
  <svelte:fragment slot="header">
    <SpaceSelector
      _class={kra.class.Project}
      label={kra.string.Project}
      bind:space={_space}
      on:object={(evt) => {
        currentProject = evt.detail ?? undefined
      }}
      kind={'regular'}
      size={'small'}
      component={ProjectPresenter}
      defaultIcon={kra.icon.Home}
      {findDefaultSpace}
    />
    <DocCreateExtComponent manager={docCreateManager} kind={'header'} space={currentProject} props={extraProps} />
  </svelte:fragment>
  <svelte:fragment slot="title" let:label>
    <div class="flex-row-center gap-2 pt-1 pb-1 pr-1">
      <span class="overflow-label">
        <Label {label} />
      </span>
      <!-- {#if relatedTo} -->
      <!--   <div class="lower mr-2"> -->
      <!--     <Label label={tracker.string.RelatedTo} /> -->
      <!--   </div> -->
      <!--   <Component -->
      <!--     is={view.component.ObjectPresenter} -->
      <!--     props={{ -->
      <!--       value: relatedTo, -->
      <!--       _class: relatedTo._class, -->
      <!--       objectId: relatedTo._id, -->
      <!--       inline: true, -->
      <!--       shouldShowAvatar: false, -->
      <!--       noUnderline: true -->
      <!--     }} -->
      <!--   /> -->
      <!-- {/if} -->
      <DocCreateExtComponent manager={docCreateManager} kind={'title'} space={currentProject} props={extraProps} />
    </div>
  </svelte:fragment>
  <div id="issue-name" class="m-3 clear-mins">
    <EditBox
      focusIndex={1}
      bind:value={object.title}
      placeholder={kra.string.TaskTitlePlaceholder}
      kind={'large-style'}
      autoFocus
      fullSize
    />
  </div>
  <!-- <div id="issue-description"> -->
  <!--   {#key [objectId, appliedTemplateId]} -->
  <!--     <AttachmentStyledBox -->
  <!--       bind:this={descriptionBox} -->
  <!--       focusIndex={2} -->
  <!--       objectId={object._id} -->
  <!--       {shouldSaveDraft} -->
  <!--       _class={tracker.class.Issue} -->
  <!--       space={_space} -->
  <!--       alwaysEdit -->
  <!--       showButtons={false} -->
  <!--       kind={'indented'} -->
  <!--       isScrollable={false} -->
  <!--       enableBackReferences={true} -->
  <!--       enableAttachments={false} -->
  <!--       bind:content={object.description} -->
  <!--       placeholder={tracker.string.IssueDescriptionPlaceholder} -->
  <!--       on:changeSize={() => dispatch('changeContent')} -->
  <!--       on:attach={(ev) => { -->
  <!--         if (ev.detail.action === 'saved') { -->
  <!--           object.attachments = ev.detail.value -->
  <!--         } -->
  <!--       }} -->
  <!--       on:attachments={(ev) => { -->
  <!--         if (ev.detail.size > 0) attachments = ev.detail.values -->
  <!--         else if (ev.detail.size === 0 && ev.detail.values != null) { -->
  <!--           attachments.clear() -->
  <!--           attachments = attachments -->
  <!--         } -->
  <!--       }} -->
  <!--     /> -->
  <!--   {/key} -->
  <!-- </div> -->
  <!-- {#if _space} -->
  <!--   <SubIssues -->
  <!--     bind:this={subIssuesComponent} -->
  <!--     projectId={_space} -->
  <!--     project={currentProject} -->
  <!--     milestone={object.milestone} -->
  <!--     component={object.component} -->
  <!--     bind:subIssues={object.subIssues} -->
  <!--   /> -->
  <!-- {/if} -->
  <DocCreateExtComponent manager={docCreateManager} kind={'body'} space={currentProject} props={extraProps} />
  <!-- <svelte:fragment slot="pool"> -->
  <!--   <div id="status-editor"> -->
  <!--     {#if kind !== undefined} -->
  <!--       <StatusEditor -->
  <!--         focusIndex={3} -->
  <!--         value={{ ...object, kind }} -->
  <!--         kind={'regular'} -->
  <!--         size={'large'} -->
  <!--         defaultIssueStatus={currentProject?.defaultIssueStatus} -->
  <!--         shouldShowLabel={true} -->
  <!--         short -->
  <!--         on:refocus={() => { -->
  <!--           manager.setFocusPos(3) -->
  <!--         }} -->
  <!--         on:change={({ detail }) => { -->
  <!--           if (object.status !== detail) { -->
  <!--             object.status = detail -->
  <!--           } -->
  <!--         }} -->
  <!--       /> -->
  <!--     {/if} -->
  <!--   </div> -->
  <!--   <div id="priority-editor"> -->
  <!--     <PriorityEditor -->
  <!--       focusIndex={4} -->
  <!--       value={object} -->
  <!--       shouldShowLabel -->
  <!--       isEditable -->
  <!--       kind={'regular'} -->
  <!--       size={'large'} -->
  <!--       justify="center" -->
  <!--       on:change={({ detail }) => { -->
  <!--         object.priority = detail -->
  <!--         manager.setFocusPos(4) -->
  <!--       }} -->
  <!--     /> -->
  <!--   </div> -->
  <!--   <div id="assignee-editor"> -->
  <!--     <AssigneeEditor -->
  <!--       focusIndex={5} -->
  <!--       {object} -->
  <!--       kind={'regular'} -->
  <!--       size={'large'} -->
  <!--       short -->
  <!--       on:change={({ detail }) => { -->
  <!--         isAssigneeTouched = true -->
  <!--         object.assignee = detail -->
  <!--         manager.setFocusPos(5) -->
  <!--       }} -->
  <!--     /> -->
  <!--   </div> -->
  <!--   <Component -->
  <!--     is={tags.component.TagsDropdownEditor} -->
  <!--     props={{ -->
  <!--       focusIndex: 6, -->
  <!--       items: object.labels, -->
  <!--       key, -->
  <!--       targetClass: tracker.class.Issue, -->
  <!--       countLabel: tracker.string.NumberLabels, -->
  <!--       kind: 'regular', -->
  <!--       size: 'large' -->
  <!--     }} -->
  <!--     on:open={(evt) => { -->
  <!--       addTagRef(evt.detail) -->
  <!--     }} -->
  <!--     on:delete={(evt) => { -->
  <!--       object.labels = object.labels.filter((it) => it._id !== evt.detail) -->
  <!--     }} -->
  <!--   /> -->
  <!--   <ComponentSelector -->
  <!--     focusIndex={7} -->
  <!--     value={object.component} -->
  <!--     space={_space} -->
  <!--     onChange={handleComponentIdChanged} -->
  <!--     isEditable={true} -->
  <!--     kind={'regular'} -->
  <!--     size={'large'} -->
  <!--   /> -->
  <!--   <div id="estimation-editor" class="new-line"> -->
  <!--     <EstimationEditor focusIndex={8} kind={'regular'} size={'large'} value={object} /> -->
  <!--   </div> -->
  <!--   <div id="milestone-editor" class="new-line"> -->
  <!--     <MilestoneSelector -->
  <!--       focusIndex={9} -->
  <!--       value={object.milestone} -->
  <!--       space={_space} -->
  <!--       onChange={handleMilestoneIdChanged} -->
  <!--       kind={'regular'} -->
  <!--       size={'large'} -->
  <!--       short -->
  <!--     /> -->
  <!--   </div> -->
  <!--   <div id="duedate-editor" class="new-line"> -->
  <!--     <DatePresenter -->
  <!--       focusIndex={10} -->
  <!--       bind:value={object.dueDate} -->
  <!--       labelNull={tracker.string.DueDate} -->
  <!--       kind={'regular'} -->
  <!--       size={'large'} -->
  <!--       editable -->
  <!--     /> -->
  <!--   </div> -->
  <!--   <div id="parentissue-editor" class="new-line"> -->
  <!--     <Button -->
  <!--       focusIndex={11} -->
  <!--       icon={tracker.icon.Parent} -->
  <!--       label={object.parentIssue != null ? tracker.string.RemoveParent : tracker.string.SetParent} -->
  <!--       kind={'regular'} -->
  <!--       size={'large'} -->
  <!--       notSelected={object.parentIssue === undefined} -->
  <!--       on:click={object.parentIssue != null ? clearParentIssue : setParentIssue} -->
  <!--     /> -->
  <!--   </div> -->
  <!--   <DocCreateExtComponent manager={docCreateManager} kind={'pool'} space={currentProject} props={extraProps} /> -->
  <!-- </svelte:fragment> -->
  <!-- <svelte:fragment slot="attachments"> -->
  <!--   {#if attachments.size > 0} -->
  <!--     {#each Array.from(attachments.values()) as attachment} -->
  <!--       <AttachmentPresenter -->
  <!--         value={attachment} -->
  <!--         showPreview -->
  <!--         removable -->
  <!--         on:remove={(result) => { -->
  <!--           if (result.detail !== undefined) descriptionBox?.removeAttachmentById(result.detail._id) -->
  <!--         }} -->
  <!--       /> -->
  <!--     {/each} -->
  <!--   {/if} -->
  <!-- </svelte:fragment> -->
  <!-- <svelte:fragment slot="footer"> -->
  <!--   <Button -->
  <!--     focusIndex={12} -->
  <!--     icon={IconAttachment} -->
  <!--     iconProps={{ fill: 'var(--theme-dark-color)' }} -->
  <!--     size={'large'} -->
  <!--     kind={'ghost'} -->
  <!--     on:click={() => { -->
  <!--       descriptionBox?.handleAttach() -->
  <!--     }} -->
  <!--   /> -->
  <!--   <DocCreateExtComponent manager={docCreateManager} kind={'footer'} space={currentProject} props={extraProps} /> -->
  <!-- </svelte:fragment> -->
  <!-- <svelte:fragment slot="buttons"> -->
  <!--   <DocCreateExtComponent manager={docCreateManager} kind={'buttons'} space={currentProject} props={extraProps} /> -->
  <!-- </svelte:fragment> -->
  <!-- <svelte:fragment slot="after-buttons" let:handleOkClick let:okProcessing let:focusIndex let:canSave let:okLabel> -->
  <!--   <DocCreateExtComponent -->
  <!--     manager={docCreateManager} -->
  <!--     kind={'createButton'} -->
  <!--     space={currentProject} -->
  <!--     props={{ -->
  <!--       ...extraProps, -->
  <!--       handleOkClick, -->
  <!--       okProcessing, -->
  <!--       focusIndex, -->
  <!--       canSave, -->
  <!--       okLabel -->
  <!--     }} -->
  <!--   > -->
  <!--     <Button -->
  <!--       loading={okProcessing} -->
  <!--       focusIndex={10001} -->
  <!--       disabled={!canSave} -->
  <!--       label={okLabel} -->
  <!--       kind={'primary'} -->
  <!--       size={'large'} -->
  <!--       on:click={handleOkClick} -->
  <!--     /> -->
  <!--   </DocCreateExtComponent> -->
  <!-- </svelte:fragment> -->
</Card>
