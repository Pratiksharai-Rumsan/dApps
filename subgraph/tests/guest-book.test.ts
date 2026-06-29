import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { MessagePosted } from "../generated/schema"
import { MessagePosted as MessagePostedEvent } from "../generated/GuestBook/GuestBook"
import { handleMessagePosted } from "../src/guest-book"
import { createMessagePostedEvent } from "./guest-book-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let author = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let message = "Example string value"
    let newMessagePostedEvent = createMessagePostedEvent(author, message)
    handleMessagePosted(newMessagePostedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("MessagePosted created and stored", () => {
    assert.entityCount("MessagePosted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MessagePosted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "author",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MessagePosted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "message",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
