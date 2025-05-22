import { type Ref } from '@hcengineering/core'
import { type Team } from '@hcengineering/kra-team'
import { writable } from 'svelte/store'

export const currentTeam = writable<Ref<Team> | undefined>(undefined)
