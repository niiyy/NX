import { RespCB } from '../../types/main'

class _Object {
  constructor() {}

  public create(entity: string, cb?: RespCB): number | void {
    if (!entity || !IsModelValid(entity)) {
      cb &&
        cb({
          status: 'error',
          message: 'not valid params to create object.',
        })
      return
    }

    RequestModel(entity)
    const i: NodeJS.Timer = setInterval(() => {
      if (HasModelLoaded(entity)) {
        const playerPed: number = PlayerPedId()
        const pos: number[] = GetEntityCoords(playerPed, true)
        const object = CreateObject(
          entity,
          pos[0],
          pos[1],
          pos[2],
          true,
          false,
          true
        )
        clearInterval(i)
        SetEntityAsNoLongerNeeded(entity as unknown as number)
        SetModelAsNoLongerNeeded(entity)
        cb &&
          cb({
            status: 'succes',
            data: object,
          })
      }
    }, 0)
  }

  public delete(entity: number, cb?: RespCB): void {
    if (!entity || typeof entity !== 'number') return

    SetEntityAsMissionEntity(entity, false, true)
    DeleteObject(entity)

    cb &&
      cb({
        status: 'succes',
        message: 'object deleted.',
      })
  }
}

const ObjectManager = new _Object()
export default ObjectManager
