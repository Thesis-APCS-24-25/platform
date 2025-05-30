<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery, SortingOrder } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, Breadcrumb, Button, Header, IconAdd, IModeSelector, Label, showPopup } from '@hcengineering/ui'
  import view, { Viewlet, ViewletDescriptor, ViewOptions } from '@hcengineering/view'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { ParentsNavigationModel, ViewConfiguration } from '@hcengineering/workbench'
  import performance from '../../plugin'
  import { ListView } from '@hcengineering/view-resources'
  import { getClient } from '@hcengineering/presentation'
  import CreateKra from './CreateKRA.svelte'

  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString = performance.string.KRA
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined

  const viewOptions: ViewOptions = {
    groupBy: ['kra'],
    orderBy: ['employee', SortingOrder.Ascending]
  }

  let viewlet: Viewlet | undefined = undefined
  void getClient()
    .findOne(view.class.Viewlet, {
      attachTo: performance.class.EmployeeKRA
    })
    .then((res) => {
      if (res !== undefined) {
        viewlet = res
      }
    })

  $: baseQuery = {
    ...baseQuery,
    space
  }
</script>

<Header>
  <Breadcrumb {icon} {label} size={'large'} isCurrent />
  <svelte:fragment slot="actions">
    <Button
      icon={IconAdd}
      size='large'
      label={performance.string.CreateKRA}
      kind="primary"
      on:click={() => {
        showPopup(
          CreateKra,
          {
            space
          },
          'top'
        )
      }}
    />
  </svelte:fragment>
</Header>

{#if viewlet !== undefined}
  <ListView
    query={baseQuery}
    createItemEvent={undefined}
    _class={performance.class.EmployeeKRA}
    configurations={undefined}
    createItemDialog={undefined}
    config={[
      {
        key: 'employee',
        displayProps: {
          fixed: 'left'
        }
      },
      {
        key: '',
        presenter: performance.component.KRAWeightEditorWithPopup,
        props: {
          readonly: true
        },
        displayProps: {
          fixed: 'right',
          dividerBefore: true
        }
      }
    ]}
    createItemLabel={undefined}
    {viewOptions}
    {viewlet}
  ></ListView>
{/if}
