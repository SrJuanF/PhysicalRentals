import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  RelistToolAvailable as RelistToolAvailableEvent,
  ToolDamageTransport as ToolDamageTransportEvent,
  ToolDamaged as ToolDamagedEvent,
  ToolInspected as ToolInspectedEvent,
  ToolListed as ToolListedEvent,
  ToolPenalized as ToolPenalizedEvent,
  ToolRented as ToolRentedEvent,
  ToolRequested as ToolRequestedEvent,
  ToolReturned as ToolReturnedEvent,
  ToolSended as ToolSendedEvent,
  errorResponseRecv as errorResponseRecvEvent,
  reportUser as reportUserEvent
} from "../generated/PhysicalRental/PhysicalRental"
import {
  ToolDamageTransport,
  ToolDamaged,
  ToolPenalized,
  errorResponseRecv,
  reportUser,
  ActiveItem
} from "../generated/schema"

/*function getIdFromEventParams(toolId: BigInt, owner: Address): string {
    return toolId.toString() + "-" + owner.toHexString();
}*/

export function handleToolListed(event: ToolListedEvent): void {
  let entity = new ActiveItem(event.params.id.toString())
  entity.toolId = event.params.id
  entity.owner = event.params.owner
  entity.rentalPriceUSET = event.params.rentalPriceUSET
  entity.depositUsEt = event.params.depositUsEt
  entity.condition = event.params.condition
  entity.status = event.params.status
  entity.renter = Address.fromString("0x0000000000000000000000000000000000000000")
  entity.rentalDuration = BigInt.fromI32(0)
  entity.save()
}

export function handleRelistToolAvailable(
  event: RelistToolAvailableEvent
): void {

  let itemListed = ActiveItem.load(event.params.id.toString())

  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }

  itemListed.rentalPriceUSET = event.params.rentalPriceUSET
  itemListed.depositUsEt = event.params.depositUsEt
  itemListed.condition = event.params.condition
  itemListed.status = event.params.status
  itemListed.renter = Address.fromString("0x0000000000000000000000000000000000000000")
  itemListed.rentalDuration = BigInt.fromI32(0)

  itemListed.save()
}
export function handleToolRequested(event: ToolRequestedEvent): void {
  let itemListed = ActiveItem.load(event.params.id.toString())
  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }

  itemListed.renter = event.params.renter
  itemListed.rentalDuration = event.params.rentalDuration
  itemListed.rentalPriceUSET = event.params.rentalPriceUSET
  itemListed.depositUsEt = event.params.depositUsEt
  itemListed.status = event.params.status
  itemListed.save()
}


export function handleToolRented(event: ToolRentedEvent): void {
  let itemListed = ActiveItem.load(event.params.id.toString())

  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }

  itemListed.renter = event.params.renter
  itemListed.rentalDuration = event.params.duration
  itemListed.rentalPriceUSET = event.params.rentalPriceUSET
  itemListed.depositUsEt = event.params.depositUsEt
  itemListed.status = event.params.status

  itemListed.save()
}
export function handleToolSended(event: ToolSendedEvent): void {
  let itemListed = ActiveItem.load(event.params.id.toString())
  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }
  itemListed.status = event.params.status
  itemListed.save()
}
export function handleToolReturned(event: ToolReturnedEvent): void {
  let itemListed = ActiveItem.load(event.params.id.toString())
  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }
  itemListed.status = event.params.status
  itemListed.save()
}

export function handleToolInspected(event: ToolInspectedEvent): void {
  let itemListed = ActiveItem.load(event.params.id.toString())
  if (!itemListed) {
    itemListed = new ActiveItem(event.params.id.toString())
  }
  itemListed.status = event.params.status
  itemListed.save()
}
export function handleToolPenalized(event: ToolPenalizedEvent): void {
  let entity = new ToolPenalized(
    event.params.id.toString()
  )
  entity.toolId = event.params.id
  entity.renter = event.params.renter

  entity.save()
}
export function handleerrorResponseRecv(event: errorResponseRecvEvent): void {
  let entity = new errorResponseRecv(event.params.requestId)
  entity.lastError = event.params.lastError
  entity.requestId = event.params.requestId
  entity.save()
}

export function handlereportUser(event: reportUserEvent): void {
  let entity = new reportUser(
    event.params.id.toString()
  )
  entity.twister = event.params.twister
  entity.toolId = event.params.id
  entity.toolWorked = event.params.toolWorked
  entity.save()
}

export function handleToolDamageTransport(
  event: ToolDamageTransportEvent
): void {
  let entity = new ToolDamageTransport(event.params.id.toString())
  entity.toolId = event.params.id
  entity.save()
}

export function handleToolDamaged(event: ToolDamagedEvent): void {
  let entity = new ToolDamaged(event.params.id.toString())
  entity.toolId = event.params.id
  entity.save()
}