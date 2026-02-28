import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export interface EnumMisfitValues extends ConstraintMisfitValues {
  actual: any
  values: any[]
}

export class Enum extends Constraint<any, EnumMisfitValues> {

  values: any[] = []

  constructor(values: any[], constraints?: Partial<Constraint>)
  constructor(...values: any[])
  constructor(values: object, constraints?: Partial<Constraint>)

  constructor(...args: any[]) {
    super(Enum.name)

    for (let i = 0; i < args.length; i++) {
      let arg = args[i]

      if (i == 0) {
        if (Array.isArray(arg)) {
          this.values.push(...arg)
        }

        else if (typeof arg == 'object') {
          for (let key in arg) {
            if (isNaN(parseInt(key, 10))) {
              this.values.push(arg[key])
            }
          }
        }

        else {
          this.values.push(arg)
        }
      }

      else if (i == args.length - 1) {
        if (typeof arg == 'object') {
          Object.assign(this, arg)
        }
      }

      else {
        this.values.push(arg)
      }
    }
  }

  async validate(value: any): Promise<Misfit<EnumMisfitValues>|null> {
    if (value === undefined) {
      return null
    }

    if (this.values.indexOf(value) == -1) {
      return new Misfit<EnumMisfitValues>(this.name, undefined, {
        actual: value,
        values: this.values
      })
    }

    return null
  }
}