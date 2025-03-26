<script lang="ts">
  import { ButtonSize, IconColStar } from '@hcengineering/ui'
  import { RatingScale } from '@hcengineering/kra'
  import RatingScaleCircle from './RatingScaleCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'

  export let value: RatingScale
  export let size: ButtonSize = 'medium'
  export let width: string | undefined = 'auto'
</script>

<GoalPresenterContainer {size} kind="regular">
  <RatingScaleCircle value={value.value ?? 0} />
</GoalPresenterContainer>
hello
