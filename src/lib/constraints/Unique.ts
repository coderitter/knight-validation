import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Unique extends Constraint {

  isUnique: (obj: any, field: string|string[]) => Promise<boolean>

  constructor(isUnique: (obj: any, field: string|string[]) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (! await this.isUnique(obj, field)) {
        return new Misfit(this.name)
      }  
    })
  }
}