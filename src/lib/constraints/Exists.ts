import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface ExistsMisfitValues {
  notExistingValue: any
}

export class Exists<T = any> extends Constraint<T, ExistsMisfitValues> {

  doesExist: (obj: T, property: string|string[]) => Promise<boolean>

  constructor(doesExist: (obj: T, property: string|string[]) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(obj: T, property: string|string[]): Promise<Misfit<ExistsMisfitValues>|null> {
    return this.defaultValidation(obj, property, async (value: any) => {
      if (! await this.doesExist(obj, property)) {
        return new Misfit(this.name, property, {
          notExistingValue: value
        })
      }

      return null
    })
  }
}
