import { MessagePosted as MessagePostedEvent } from "../generated/GuestBook/GuestBook"
import { MessagePosted } from "../generated/schema"

export function handleMessagePosted(event: MessagePostedEvent): void {
  let entity = new MessagePosted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.author = event.params.author
  entity.message = event.params.message

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
