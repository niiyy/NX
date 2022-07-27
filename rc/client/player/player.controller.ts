import ItemsService from 'c@items/items.service'
import { InventoryEeventsE, PlayerEventsE } from '../../types/events'
import { InventoryActions } from '../../types/main'
import Player from './player.class'
import PlayerService from './player.service'

const interval = setInterval(() => {
  const ped = PlayerId()
  if (NetworkIsPlayerActive(ped)) {
    globalThis.exports.spawnmanager.setAutoSpawn(false)
    emitNet(PlayerEventsE.NEW_PLAYER)
    SetCanAttackFriendly(ped, true, false)
    NetworkSetFriendlyFireOption(true)
    clearInterval(interval)
  }
}, 500)

onNet(
  PlayerEventsE.ADD_STATUS,
  ({ status, amount }: { status: string; amount: number }) => {
    if (status !== 'thirst' && status !== 'hunger') return
    const nxPlayerData = Player.getPlayerData()
    Player.setStatus(status, parseFloat(nxPlayerData.charinfo[status]) + amount)
  }
)

onNet(PlayerEventsE.PLAYER_LOADED, (nxPlayer: any) => {
  Player.setPlayerData(nxPlayer)
  Player.setValue('ped', PlayerPedId())
  Player.loaded = true
  globalThis.exports.spawnmanager.spawnPlayer(
    {
      x: nxPlayer.position.x,
      y: nxPlayer.position.y,
      z: nxPlayer.position.z,
      heading: nxPlayer.position.heading,
      model: GetHashKey('mp_m_freemode_01'),
      skipFade: true,
    },
    () => {
      emit('skinchanger:loadSkin', nxPlayer.skin)
      ItemsService.handlePickupsPickup()
      PlayerService.syncPlayer()
    }
  )
})

//
// ! i'm gonna refactor this don't worry :)
//
onNet(
  InventoryEeventsE.UPDATE_INVENTORY,
  ({
    item,
    type,
  }: {
    type: 'ADD' | 'REMOVE'
    item: { name: string; amount: number; type: string }
  }) => {
    const nxPlayerInventory = Player.getPlayerData().inventory

    if (type === 'REMOVE') {
      const itemData = nxPlayerInventory[item.name]
      if (item.amount === 0) {
        delete nxPlayerInventory[item.name]
      } else {
        nxPlayerInventory[item.name] = {
          type: item.type,
          amount: item.amount,
        }
      }
    }

    if (type === 'ADD') {
      nxPlayerInventory[item.name] = {
        amount: item.amount,
        type: item.type,
      }
    }

    Player.setValue('inventory', nxPlayerInventory)
  }
)
