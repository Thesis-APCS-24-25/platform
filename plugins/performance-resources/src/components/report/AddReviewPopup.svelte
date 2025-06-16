<script lang="ts">
  import { PerformanceReport, PerformanceReview } from '@hcengineering/performance'
  import performance from '../../plugin'
  import { Ref, Space } from '@hcengineering/core'
  import { Card, getClient } from '@hcengineering/presentation'
  import { TextEditor } from '@hcengineering/text-editor-resources'
  import { EditBox } from '@hcengineering/ui'

  const client = getClient()

  export let report: Ref<PerformanceReport>
  export let space: Ref<Space>
  export let _id: Ref<PerformanceReview>
  export let content: string | undefined
  export let score: number | undefined
  export let type: 'add' | 'edit' = 'add'

  const label = type === 'add'
    ? performance.string.AddPerformanceReview
    : performance.string.EditPerformanceReview

  async function submitReview (): Promise<void> {
    if (type === 'add') {
      await client.createDoc(
        performance.class.PerformanceReview,
        space,
        {
          content: _content,
          score: _score,
          report
        }
      )
    } else if (type === 'edit') {
      await client.updateDoc(
        performance.class.PerformanceReview,
        space,
        _id,
        {
          content: _content,
          score: _score
        }
      )
    }
  }

  let _content: string = content ?? ''
  let _score: number = score
</script>

<Card
  {label}
  okAction={submitReview}
  canSave={_content !== '' && Number.isInteger(_score)}
  okLabel={performance.string.SubmitReview}
  on:changeContent
  on:close
>
  <div class="flex-row-center m-3 clear-mins">
    <TextEditor
      bind:content={_content}
      placeholder={performance.string.ReviewContentPlaceholder}
    />
  </div>

  <div class="flex-row-center m-3 clear-mins">
    <EditBox
      bind:value={_score}
      label={performance.string.ReviewerScore}
      placeholder={performance.string.InputScore}
      format={'number'}
    />
  </div>
</Card>
