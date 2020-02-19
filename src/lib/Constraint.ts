import Misfit from './Misfit'

export default abstract class Constraint {

  name: string = this.constructor.name

  abstract validate(obj: any, field: string|string[]): Promise<Misfit|undefined>

  protected async defaultValidation(obj: any, field: string|string[], validateValue: (value: any) => Promise<Misfit|undefined>): Promise<Misfit|undefined> {
    if (this.isFieldAbsent(obj, field)) {
      return
    }

    if (typeof field == 'string') {
      let value = obj[field]
      return validateValue(value)
    }
    else if (field instanceof Array) {
      for (let fld of field) {
        let value = obj[fld]
        let misfit = await validateValue(value)

        if (misfit) {
          return misfit
        }
      }
    }
    else {
      throw new Error('Parameter field was neither of type string nor instance of Array')
    }
  }

  async validateValue(value: any): Promise<Misfit|undefined> {
    let misfit = await this.validate({ value: value }, 'value')

    if (misfit) {
      return misfit
    }
  }

  isFieldAbsent(obj: any, field: string|string[]): boolean {
    if (typeof field == 'string') {
      let value = obj[field]

      if (Constraint.absent(value)) {
        return true
      }  
    }
    else if (field instanceof Array) {
      for (let fld of field) {
        let value = obj[fld]

        if (Constraint.absent(value)) {
          return true
        }
      }
    }
    else {
      throw new Error('Parameter field was neither of type string nor instance of Array')
    }

    return false
  }

  static absent(value: any): boolean {
    return value === undefined || 
      value === null || 
      value === '' || 
      typeof value === 'number' && isNaN(value)
  }
}