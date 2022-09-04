import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Required extends Constraint<any, void> {

  async validate(value: any): Promise<Misfit<void>|null> {
    return value === undefined ? new Misfit(this.name) : null
  }
}