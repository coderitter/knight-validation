import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface ExistsMisfitValues {
  notExistingValue: any
}

export class Exists<T = any> extends Constraint<T, ExistsMisfitValues> {

  doesExist: (obj: T, properties: string|string[]) => Promise<boolean>

  constructor(doesExist: (obj: T, properties: string|string[]) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(obj: T, properties: string|string[]): Promise<Misfit<ExistsMisfitValues>|null> {
    return this.defaultValidation(obj, properties, async (value: any) => {
      if (! await this.doesExist(obj, properties)) {
        return new Misfit(this.name, properties, {
          notExistingValue: value
        })
      }

      return null
    })
  }
}
