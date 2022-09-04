import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface ExistsMisfitValues {
  notExistingValue: any
}

export class Exists extends Constraint<any, ExistsMisfitValues> {

  doesExist: (value: any) => Promise<boolean>

  constructor(doesExist: (value: any) => Promise<boolean>) {
    super()
    this.doesExist = doesExist
  }

  async validate(value: any): Promise<Misfit<ExistsMisfitValues>|null> {
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
