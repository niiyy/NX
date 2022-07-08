import Player from './player/player.service'
import Items from './items/items.service'
import Events from './events'
import './player/index'
import './items/index'
import './boot'

class Server {
  Players: typeof Player
  Events: typeof Events
  Items: typeof Items
  constructor() {
    this.Players = Player
    this.Events = Events
    this.Items = Items
  }
}

const server = new Server()

globalThis.exports('useServer', () => {
  return {
    Players: {
      GetAll: server.Players.getPlayers.bind(server.Players),
      Get: server.Players.getPlayer.bind(server.Players),
    },

    Misc: {
      RegisterUsableItem: server.Items.registerUsableItem.bind(server.Items),
      OnServerEvent: server.Events.onServerEvent.bind(server.Events),
    },
  }
})