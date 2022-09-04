import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface ExistsMisfitValues {
  notExistingValue: any
}

export class Exists extends Constraint<ExistsMisfitValues> {

  doesExist: (obj: any, field: string|string[]) => Promise<boolean>

  constructor(doesExist: (obj: any, field: string|string[]) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit<ExistsMisfitValues>|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (! await this.doesExist(obj, field)) {
        return new Misfit(this.name, field, {
          notExistingValue: value
        })
      }
    })
  }
}
