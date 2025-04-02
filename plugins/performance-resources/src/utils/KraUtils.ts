import core, { AttachedData, DocumentQuery, Rank, SortingOrder, Space, Status, type Data } from "@hcengineering/core"
import { Ref, TxOperations } from "@hcengineering/core";
import { KRA } from "@hcengineering/performance";
import performance from '../plugin'
import { makeRank } from "@hcengineering/task";

export async function getFirstRank (
  client: TxOperations,
  space: Ref<Space>,
  sort: SortingOrder = SortingOrder.Descending,
  extra: DocumentQuery<KRA> = {}
): Promise<Rank | undefined> {
  const doc = await client.findOne(
    performance.class.KRA,
    { space, ...extra },
    { sort: { rank: sort }, projection: { rank: 1 } }
  )

  return doc?.rank
}

export async function createKRA(
	client: TxOperations,
	title: string,
	description: string,
	space: Ref<Space>,
	status: Ref<Status>,
	attributes: Partial<AttachedData<KRA>> & { kind: KRA['kind'] }
): Promise<Ref<KRA>> {
	const sequence = await client.findOne(core.class.Sequence, { attachedTo: performance.class.KRA })
  if (sequence === undefined) {
    throw new Error('sequence object not found')
  }

  const lastOne = await client.findOne(performance.class.KRA, {}, { sort: { rank: SortingOrder.Descending } })
  const incResult = await client.update(sequence, { $inc: { sequence: 1 } }, true)
  const number = (incResult as any).object.sequence
  const rank = makeRank(lastOne?.rank, undefined)

	const object: AttachedData<KRA> = {
		title,
		status,
		kraStatus: performance.kraStatus.Drafting,
		dueDate: null,
		number,
		rank,
		assignee: null,
		identifier: 'CARD-${number}',	
		description,
		...attributes
	}

	return await client.addCollection(performance.class.KRA, space, space, performance.class.ReviewSession, 'kras', object)
}