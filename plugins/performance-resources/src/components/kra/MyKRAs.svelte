<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery, getCurrentAccount } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, IModeSelector } from '@hcengineering/ui'
  import { ViewletDescriptor } from '@hcengineering/view'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { ParentsNavigationModel } from '@hcengineering/workbench'
  import { createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import AllKRAs from './AllKRAs.svelte'

  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString
  export let createEvent: string | undefined = undefined
  export let createLabel: IntlString | undefined = undefined
  export let createComponent: AnyComponent | undefined = undefined
  export let createComponentProps: Record<string, any> = {}
  export let createButton: AnyComponent | undefined = undefined
  export let isCreationDisabled = false
  export let descriptors: Array<Ref<ViewletDescriptor>> | undefined = undefined
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined
  export let modes: IModeSelector<any> | undefined = undefined
  export let navigationModel: ParentsNavigationModel | undefined = undefined

  const userId = getCurrentAccount()._id as Ref<PersonAccount>
  const employeeKRAQuery = createQuery()
  employeeKRAQuery.query(
    performance.class.EmployeeKRA,
    {
      employee: userId
    },
    (res) => {
      if (res !== undefined) {
        const kras = res.map((item) => {
          return item.kra
        })

        baseQuery = {
          ...baseQuery,
          _id: {
            $in: kras
          }
        }
      }
    }
  )
</script>
