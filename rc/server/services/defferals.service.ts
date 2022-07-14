import PlayerService from 's@player/player.service'
import PlayerUtils from 's@player/player.utils'
import { logger } from 's@utils/logger'

class _DeferralsService {
  constructor() {}

  async validatePlayer(
    source: number,
    name: string,
    identifiers: string[],
    deferrals: any,
    reject: Function
  ) {
    deferrals.defer()
    deferrals.update(`${name} wait while checking your license`)

    const license = await PlayerUtils.getPlayerLicense(identifiers)

    if (!license) {
      return deferrals.done('Not valid license')
    }

    PlayerService.doesPlayerExist(license)
      .then(() => {
        deferrals.done()
      })
      .catch((player) => {
        deferrals.done(
          `Player already connected with the same license: ${license}`
        )
        logger.warn(
          `Player: [${name}] tried to connect with the same license as: [${player.name}] | license: ${license}`
        )
      })
  }
}

const DeferralsService = new _DeferralsService()
export default DeferralsService