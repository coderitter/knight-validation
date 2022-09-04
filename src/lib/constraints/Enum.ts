import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface EnumMisfitValues {
  actual: any
  values: any[]
}

export class Enum<T = any> extends Constraint<T, EnumMisfitValues> {

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

  async validate(obj: T, property: string|string[]): Promise<Misfit<EnumMisfitValues>|null> {
    return this.defaultValidation(obj, property, async (value: any) => {
      if (this.values.indexOf(value) == -1) {
        return new Misfit<EnumMisfitValues>(this.name, property, {
          actual: value,
          values: this.values
        })
      }

      return null
    })
  }
}