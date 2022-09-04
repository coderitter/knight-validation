import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Enum extends Constraint {

  values: any[] = []

  constructor(values: any[])
  constructor(...values: any[])
  constructor(values: object)

  constructor(...values: any) {
    super()

    for (let value of values) {
      if (value instanceof Array) {
        this.values.push(...value)
      }

      else if (typeof value == 'object') {
        for (let key in value) {
          if (isNaN(parseInt(key, 10))) {
            this.values.push(value[key])
          }
        }  
      }

      else {
        this.values.push(value)
      }
    }
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (this.values.indexOf(value) == -1) {
        return new Misfit('Enum', field, { ...this, actual: value })
      }
    })
  }
}