import './bans'
import './boot'
import Commands from './commands/commands.service'
import './discord'
import Discord from './discord/discord.service'
import Events from './events'
import './exports'
import './items'
import Items from './items/items.service'
import './player'
import Player from './player/player.service'

class Server {
  Players: typeof Player
  Events: typeof Events
  Items: typeof Items
  Discord: typeof Discord
  Commands: typeof Commands
  constructor() {
    this.Players = Player
    this.Events = Events
    this.Items = Items
    this.Discord = Discord
    this.Commands = Commands
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
      AddCommand: server.Commands.addCommand.bind(server.Commands),
    },
    Discord: {
      SendWebhook: server.Discord.sendWebhook.bind(server.Discord),
    },
  }
})
