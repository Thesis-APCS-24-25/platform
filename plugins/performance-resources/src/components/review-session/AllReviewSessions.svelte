<script lang="ts">
  import { Ref, Class, Doc, Space, DocumentQuery, checkPermission } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, IModeSelector } from '@hcengineering/ui'
  import { ViewletDescriptor } from '@hcengineering/view'
  import { ParentsNavigationModel } from '@hcengineering/workbench'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import CreateReviewSessionButton from './CreateReviewSessionButton.svelte'
  import { currentTeam } from '../../utils/team'
  import { getClient } from '@hcengineering/presentation'
  import kraTeam from '@hcengineering/kra-team'
  import performance from '../../plugin'

  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString
  export let createEvent: string | undefined = undefined
  export let createButton: AnyComponent | undefined = undefined
  export let descriptors: Array<Ref<ViewletDescriptor>> | undefined = undefined
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined
  export let modes: IModeSelector<any> | undefined = undefined
  export let navigationModel: ParentsNavigationModel | undefined = undefined

  $: baseQuery = {
    ...baseQuery,
    space: $currentTeam ?? '' as Ref<Space>
  }

  const client = getClient()

  let canCreateReviewSession = false
  $: if ($currentTeam !== undefined) {
    void checkPermission(client, kraTeam.permission.CreateReviewSession, $currentTeam).then((canView) => {
      canCreateReviewSession = canView
    })
  }
</script>

<SpecialView
  {_class}
  {space}
  {icon}
  {label}
  {createEvent}
  createLabel={performance.string.CreateReviewSession}
  createComponent={performance.component.CreateReviewSession}
  {createButton}
  isCreationDisabled={!canCreateReviewSession}
  {descriptors}
  {baseQuery}
  {modes}
  {navigationModel}
/>
