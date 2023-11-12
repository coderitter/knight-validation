import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface ExistsMisfitValues {
  notExistingValue: any
}

export class Exists<T> extends Constraint<T, ExistsMisfitValues> {

  doesExist: (value: T) => Promise<boolean>

  constructor(doesExist: (value: T) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(value: T): Promise<Misfit<ExistsMisfitValues>|null> {
    if (value !== undefined) {
      if (! await this.doesExist(value)) {
        return new Misfit(this.name, {
          notExistingValue: value
        })
      }  
    }

    return null
  }
}
