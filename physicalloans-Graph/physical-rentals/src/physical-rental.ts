import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  PhysicalRental,
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
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using an ID; this ID
  // needs to be unique across all entities of the same type
  const id = event.transaction.hash.concat(
    Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))
  )
  let entity = ExampleEntity.load(id)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(id)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.approved = event.params.approved

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.checkUpkeep(...)
  // - contract.getActiveRental(...)
  // - contract.getApproved(...)
  // - contract.getBalance(...)
  // - contract.getMinMint(...)
  // - contract.getRentalNearLine(...)
  // - contract.getTool(...)
  // - contract.isApprovedForAll(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.ownerOf(...)
  // - contract.receiveTool(...)
  // - contract.s_lastRequest(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenURI(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleBatchMetadataUpdate(event: BatchMetadataUpdate): void {}

export function handleMetadataUpdate(event: MetadataUpdate): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleRelistToolAvailable(event: RelistToolAvailable): void {}

export function handleRequestFulfilled(event: RequestFulfilled): void {}

export function handleRequestSent(event: RequestSent): void {}

export function handleToolDamageTransport(event: ToolDamageTransport): void {}

export function handleToolDamaged(event: ToolDamaged): void {}

export function handleToolInspected(event: ToolInspected): void {}

export function handleToolListed(event: ToolListed): void {}

export function handleToolPenalized(event: ToolPenalized): void {}

export function handleToolRented(event: ToolRented): void {}

export function handleToolRequested(event: ToolRequested): void {}

export function handleToolReturned(event: ToolReturned): void {}

export function handleToolSended(event: ToolSended): void {}

export function handleTransfer(event: Transfer): void {}

export function handleerrorResponseRecv(event: errorResponseRecv): void {}

export function handlereportUser(event: reportUser): void {}
