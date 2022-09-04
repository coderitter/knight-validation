import { Misfit } from './Misfit'

export abstract class Constraint<MisfitValuesType = any> {

  name: string = this.constructor.name

  abstract validate(obj: any, field: string|string[]): Promise<Misfit<MisfitValuesType>|undefined>

  protected async defaultValidation(obj: any, field: string|string[], validateValue: (value: any) => Promise<Misfit<MisfitValuesType>|undefined>, doNotValidateIfUndefined = true): Promise<Misfit<MisfitValuesType>|undefined> {
    if (typeof field == 'string') {
      let value = obj[field]

      if (doNotValidateIfUndefined && value === undefined) {
        return
      }
    
      let misfit = await validateValue(value)
      if (misfit && misfit.constraint == undefined) {
        misfit.constraint = this.name
      }

      return misfit
    }
    else if (field instanceof Array) {
      let misfit
      let everyValueAbsent = true

      for (let fld of field) {
        let value = obj[fld]

        if (doNotValidateIfUndefined && value === undefined) {
          continue
        }

        everyValueAbsent = false

        if (! misfit) {
          misfit = await validateValue(value)
        }
      }

      if (! everyValueAbsent) {
        if (misfit && misfit.constraint == undefined) {
          misfit.constraint = this.name
        }

        return misfit
      }
    }
    else {
      throw new Error('Parameter field was neither of type string nor instance of Array')
    }
  }
}
