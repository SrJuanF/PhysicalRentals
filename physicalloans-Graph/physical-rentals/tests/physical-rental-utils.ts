import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  BatchMetadataUpdate,
  MetadataUpdate,
  OwnershipTransferred,
  RelistToolAvailable,
  RequestFulfilled,
  RequestSent,
  ToolDamageTransport,
  ToolDamaged,
  ToolInspected,
  ToolListed,
  ToolPenalized,
  ToolRented,
  ToolRequested,
  ToolReturned,
  ToolSended,
  Transfer,
  errorResponseRecv,
  reportUser
} from "../generated/PhysicalRental/PhysicalRental"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBatchMetadataUpdateEvent(
  _fromTokenId: BigInt,
  _toTokenId: BigInt
): BatchMetadataUpdate {
  let batchMetadataUpdateEvent = changetype<BatchMetadataUpdate>(newMockEvent())

  batchMetadataUpdateEvent.parameters = new Array()

  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_fromTokenId",
      ethereum.Value.fromUnsignedBigInt(_fromTokenId)
    )
  )
  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_toTokenId",
      ethereum.Value.fromUnsignedBigInt(_toTokenId)
    )
  )

  return batchMetadataUpdateEvent
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
  let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent())

  metadataUpdateEvent.parameters = new Array()

  metadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return metadataUpdateEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRelistToolAvailableEvent(
  id: BigInt,
  owner: Address,
  rentalPriceUSET: BigInt,
  depositUsEt: BigInt,
  condition: i32,
  status: i32
): RelistToolAvailable {
  let relistToolAvailableEvent = changetype<RelistToolAvailable>(newMockEvent())

  relistToolAvailableEvent.parameters = new Array()

  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam(
      "rentalPriceUSET",
      ethereum.Value.fromUnsignedBigInt(rentalPriceUSET)
    )
  )
  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam(
      "depositUsEt",
      ethereum.Value.fromUnsignedBigInt(depositUsEt)
    )
  )
  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam(
      "condition",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(condition))
    )
  )
  relistToolAvailableEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return relistToolAvailableEvent
}

export function createRequestFulfilledEvent(id: Bytes): RequestFulfilled {
  let requestFulfilledEvent = changetype<RequestFulfilled>(newMockEvent())

  requestFulfilledEvent.parameters = new Array()

  requestFulfilledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestFulfilledEvent
}

export function createRequestSentEvent(id: Bytes): RequestSent {
  let requestSentEvent = changetype<RequestSent>(newMockEvent())

  requestSentEvent.parameters = new Array()

  requestSentEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestSentEvent
}

export function createToolDamageTransportEvent(
  id: BigInt
): ToolDamageTransport {
  let toolDamageTransportEvent = changetype<ToolDamageTransport>(newMockEvent())

  toolDamageTransportEvent.parameters = new Array()

  toolDamageTransportEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return toolDamageTransportEvent
}

export function createToolDamagedEvent(id: BigInt): ToolDamaged {
  let toolDamagedEvent = changetype<ToolDamaged>(newMockEvent())

  toolDamagedEvent.parameters = new Array()

  toolDamagedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return toolDamagedEvent
}

export function createToolInspectedEvent(
  id: BigInt,
  status: i32
): ToolInspected {
  let toolInspectedEvent = changetype<ToolInspected>(newMockEvent())

  toolInspectedEvent.parameters = new Array()

  toolInspectedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolInspectedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolInspectedEvent
}

export function createToolListedEvent(
  id: BigInt,
  owner: Address,
  rentalPriceUSET: BigInt,
  depositUsEt: BigInt,
  condition: i32,
  status: i32
): ToolListed {
  let toolListedEvent = changetype<ToolListed>(newMockEvent())

  toolListedEvent.parameters = new Array()

  toolListedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolListedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  toolListedEvent.parameters.push(
    new ethereum.EventParam(
      "rentalPriceUSET",
      ethereum.Value.fromUnsignedBigInt(rentalPriceUSET)
    )
  )
  toolListedEvent.parameters.push(
    new ethereum.EventParam(
      "depositUsEt",
      ethereum.Value.fromUnsignedBigInt(depositUsEt)
    )
  )
  toolListedEvent.parameters.push(
    new ethereum.EventParam(
      "condition",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(condition))
    )
  )
  toolListedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolListedEvent
}

export function createToolPenalizedEvent(
  id: BigInt,
  renter: Address
): ToolPenalized {
  let toolPenalizedEvent = changetype<ToolPenalized>(newMockEvent())

  toolPenalizedEvent.parameters = new Array()

  toolPenalizedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolPenalizedEvent.parameters.push(
    new ethereum.EventParam("renter", ethereum.Value.fromAddress(renter))
  )

  return toolPenalizedEvent
}

export function createToolRentedEvent(
  id: BigInt,
  renter: Address,
  duration: BigInt,
  rentalPriceUSET: BigInt,
  depositUsEt: BigInt,
  status: i32
): ToolRented {
  let toolRentedEvent = changetype<ToolRented>(newMockEvent())

  toolRentedEvent.parameters = new Array()

  toolRentedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolRentedEvent.parameters.push(
    new ethereum.EventParam("renter", ethereum.Value.fromAddress(renter))
  )
  toolRentedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )
  toolRentedEvent.parameters.push(
    new ethereum.EventParam(
      "rentalPriceUSET",
      ethereum.Value.fromUnsignedBigInt(rentalPriceUSET)
    )
  )
  toolRentedEvent.parameters.push(
    new ethereum.EventParam(
      "depositUsEt",
      ethereum.Value.fromUnsignedBigInt(depositUsEt)
    )
  )
  toolRentedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolRentedEvent
}

export function createToolRequestedEvent(
  id: BigInt,
  renter: Address,
  rentalDuration: BigInt,
  rentalPriceUSET: BigInt,
  depositUsEt: BigInt,
  status: i32
): ToolRequested {
  let toolRequestedEvent = changetype<ToolRequested>(newMockEvent())

  toolRequestedEvent.parameters = new Array()

  toolRequestedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolRequestedEvent.parameters.push(
    new ethereum.EventParam("renter", ethereum.Value.fromAddress(renter))
  )
  toolRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "rentalDuration",
      ethereum.Value.fromUnsignedBigInt(rentalDuration)
    )
  )
  toolRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "rentalPriceUSET",
      ethereum.Value.fromUnsignedBigInt(rentalPriceUSET)
    )
  )
  toolRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "depositUsEt",
      ethereum.Value.fromUnsignedBigInt(depositUsEt)
    )
  )
  toolRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolRequestedEvent
}

export function createToolReturnedEvent(id: BigInt, status: i32): ToolReturned {
  let toolReturnedEvent = changetype<ToolReturned>(newMockEvent())

  toolReturnedEvent.parameters = new Array()

  toolReturnedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolReturnedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolReturnedEvent
}

export function createToolSendedEvent(id: BigInt, status: i32): ToolSended {
  let toolSendedEvent = changetype<ToolSended>(newMockEvent())

  toolSendedEvent.parameters = new Array()

  toolSendedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  toolSendedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return toolSendedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createerrorResponseRecvEvent(
  requestId: Bytes,
  lastError: Bytes
): errorResponseRecv {
  let errorResponseRecvEvent = changetype<errorResponseRecv>(newMockEvent())

  errorResponseRecvEvent.parameters = new Array()

  errorResponseRecvEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromFixedBytes(requestId)
    )
  )
  errorResponseRecvEvent.parameters.push(
    new ethereum.EventParam("lastError", ethereum.Value.fromBytes(lastError))
  )

  return errorResponseRecvEvent
}

export function createreportUserEvent(
  twister: Address,
  id: BigInt,
  toolWorked: boolean
): reportUser {
  let reportUserEvent = changetype<reportUser>(newMockEvent())

  reportUserEvent.parameters = new Array()

  reportUserEvent.parameters.push(
    new ethereum.EventParam("twister", ethereum.Value.fromAddress(twister))
  )
  reportUserEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  reportUserEvent.parameters.push(
    new ethereum.EventParam(
      "toolWorked",
      ethereum.Value.fromBoolean(toolWorked)
    )
  )

  return reportUserEvent
}
