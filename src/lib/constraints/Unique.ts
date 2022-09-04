import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Unique extends Constraint {

  isUnique: (value: any, obj: any) => Promise<boolean>

  constructor(isUnique: (obj: any, field: string|string[]) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    if (this.isFieldAbsent(obj, field)) {
      return
    }

    if (! await this.isUnique(obj, field)) {
      return new Misfit(this.name)
    }
  }
}