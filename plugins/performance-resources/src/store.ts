// stores.ts
import { type Ref } from '@hcengineering/core'
import { type Team } from '@hcengineering/kra-team'
import { type ReviewSession } from '@hcengineering/performance'
import { writable } from 'svelte/store'

export const team = writable<Ref<Team>>(undefined)

export const currentTeam = writable<Team>(undefined)

export const activeReviewSession = writable<Ref<ReviewSession> | undefined>(undefined)
