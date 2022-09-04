import { Misfit } from './Misfit'

export class MisfitsError extends Error {
  misfits: Misfit[]

  constructor(misfits: Misfit|Misfit[]) {
    super('Misfits occured ' + JSON.stringify(misfits))
    
    this.misfits = misfits instanceof Array ? misfits : [ misfits ]
  }
}