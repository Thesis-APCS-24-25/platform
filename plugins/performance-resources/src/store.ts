// stores.ts
import { Ref } from '@hcengineering/core';
import { Team } from '@hcengineering/kra-team';
import { writable } from 'svelte/store';

export const team = writable<Ref<Team>>(undefined);