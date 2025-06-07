<script lang="ts">
  import type { ButtonKind, ButtonSize } from '@hcengineering/ui'

  import StatusEditor from './ReviewSessionStatusEditor.svelte'
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'

  export let value: ReviewSessionStatus
  export let object: ReviewSession
  export let onChange: ((value: ReviewSessionStatus) => void) | undefined = undefined
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = '100%'
  export let shouldShowAvatar: boolean = true
  export let accent: boolean = false
  export let readonly: boolean = false

  $: disabled = onChange === undefined || readonly
</script>

<StatusEditor
  {value}
  {object}
  {kind}
  {size}
  {width}
  {justify}
  {disabled}
  {accent}
  {shouldShowAvatar}
  on:change={({ detail }) => onChange?.(detail)}
/>
