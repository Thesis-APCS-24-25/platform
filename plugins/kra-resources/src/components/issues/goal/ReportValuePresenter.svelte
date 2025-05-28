<script lang="ts">
  export let value: WithLookup<Report>
  // export let label: IntlString
  export let placeholder: IntlString
  export let autoFocus: boolean = false
  // export let maxWidth: string = '10rem'

  const onChange: ((value: number | undefined) => Promise<void> | undefined) = undefined
  export let kind: 'no-border' | 'link' | 'button' = 'no-border'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'


</script>
