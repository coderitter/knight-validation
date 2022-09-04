import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Exists extends Constraint {

  doesExist: (value: any, obj: any) => Promise<boolean>

  constructor(doesExist: (obj: any, field: string|string[]) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    if (this.isFieldAbsent(obj, field)) {
      return
    }

    if (! await this.doesExist(obj, field)) {
      return new Misfit
    }
  }
}