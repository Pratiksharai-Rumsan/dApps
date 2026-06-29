import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { MessagePosted } from "../generated/GuestBook/GuestBook"

export function createMessagePostedEvent(
  author: Address,
  message: string
): MessagePosted {
  let messagePostedEvent = changetype<MessagePosted>(newMockEvent())

  messagePostedEvent.parameters = new Array()

  messagePostedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  messagePostedEvent.parameters.push(
    new ethereum.EventParam("message", ethereum.Value.fromString(message))
  )

  return messagePostedEvent
}
