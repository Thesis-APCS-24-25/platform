// stores.ts
import { type Ref } from '@hcengineering/core'
import { type Team } from '@hcengineering/kra-team'
import { writable } from 'svelte/store'

export const team = writable<Ref<Team>>(undefined)
