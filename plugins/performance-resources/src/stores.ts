import { createQuery, onClient } from '@hcengineering/presentation'
import { writable } from 'svelte/store'
import performance, { type Unit } from '@hcengineering/performance'
import { toIdMap, type IdMap } from '@hcengineering/core'

export const unitStore = writable<IdMap<Unit>>(new Map())

const unitQuery = createQuery(true)
onClient(() => {
  unitQuery.query(
    performance.class.Unit,
    {},
    (res) => {
      unitStore.set(toIdMap(res))
    },
    {
      limit: 1000
    }
  )
})
