import { Logger } from 'winston'
import { items } from '../../shared/load.file'
import Utils from '../../shared/utils/misc'
import { ItemsEventsE } from '../../types/events'
import { ItemT, PickupT } from '../../types/items'
import PlayerService from '../player/player.service'
import { logger } from '../utils/logger'

export class _ItemsService {
  Items: ItemT[]
  Pickups: PickupT[]
  UsableItems: any
  constructor() {
    this.Items = items
    this.Pickups = []
    this.UsableItems = {}
  }

  isValidItem(itemName: string): false | ItemT {
    const item = this.Items.find((item) => item.name === itemName)

    if (!item) return false

    return item
  }

  getItemWeight(itemName: string): number {
    const item = this.Items.find((item) => item.name === itemName)

    if (!item) {
      return 0
    }

    return item.weight
  }

  getItemType(name: string): string | null {
    const item = this.isValidItem(name)

    if (item) {
      return item.type
    }

    return null
  }

  createPickup(
    name: string,
    amount: number,
    coords: number[],
    label: string,
    propsType: string
  ): void {
    const uuid = Utils.uuid()
    this.Pickups.push({
      name,
      amount,
      coords,
      uuid: uuid as string,
      label,
      propsType,
    })

    emitNet(
      ItemsEventsE.CREATE_PICKUP,
      -1,
      name,
      amount,
      coords,
      uuid,
      label,
      propsType
    )
  }

  findItem(name: string): false | ItemT {
    const item = this.Items.find((item) => item.name === name)

    if (item) {
      return item
    }

    return false
  }

  async dropItem(name: string, amount: number, source: number): Promise<void> {
    const naPlayer = await PlayerService.getPlayer(source)

    if (naPlayer) {
      const itemInfo = await this.findItem(name)
      if (itemInfo) {
        itemInfo.label = itemInfo.label.toLowerCase()
        const label = `~r~${amount} ~s~${itemInfo.label}`
        const propsToCreate = itemInfo.props
        naPlayer.RemoveInventoryItem(name, amount, () => {
          const { x, y, z } = naPlayer.GetCoords()
          this.createPickup(name, amount, [x, y, z], label, propsToCreate)
        })
      }
    }
  }

  createMissingPickups(source: number): void {
    if (this.Pickups.length > 0) {
      emitNet(ItemsEventsE.CREATE_MISSING_PICKUPS, source, this.Pickups)
    }
  }

  findPickupById(uuid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const pickup = this.Pickups.find((pickup) => pickup.uuid === uuid)

      if (pickup) {
        return resolve(pickup)
      }

      reject('')
    })
  }

  async takePickup(uuid: string, source: number): Promise<void> {
    this.findPickupById(uuid)
      .then(async (pickup: PickupT) => {
        this.Pickups = this.Pickups.filter((pic) => pic.uuid !== pickup.uuid)
        const naPlayer = await PlayerService.getPlayer(source)
        if (naPlayer) {
          console.log(naPlayer)
          naPlayer.AddInventoryItem(pickup.name, pickup.amount, () => {
            emitNet(ItemsEventsE.REMOVE_PICKUP, -1, pickup.uuid)
          })
        }
      })
      .catch((err) => {})
  }

  registerUsableItem(name: string, cb: Function): void {
    if (!cb || typeof cb !== 'function') {
      logger.error(
        'function callback most be provided. [Misc.RegisterUsableItem]'
      )
      return
    }

    if (this.UsableItems[name]) {
      logger.warn(
        `item: [${name}] has already being registerd. [MISC.RegisterUsableItem]`
      )
    }

    this.UsableItems[name] = cb
  }

  async useItem(name: string, source: number, ...args: any[]): Promise<void> {
    if (!this.UsableItems[name]) {
      logger.error(`can't use item: ${name} he is not registerd.`)
      return
    }

    this.UsableItems[name](source, args)
  }
}

const ItemsService = new _ItemsService()
export default ItemsService