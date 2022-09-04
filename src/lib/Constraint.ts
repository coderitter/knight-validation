import { Misfit } from './Misfit'

export abstract class Constraint<T = any, MisfitValuesType = any> {

  name: string = this.constructor.name

  abstract validate(obj: T, property: string|string[]): Promise<Misfit<MisfitValuesType>|undefined>

  protected async defaultValidation(obj: T, property: string|string[], validateValue: (value: any) => Promise<Misfit<MisfitValuesType>|undefined>, doNotValidateIfUndefined = true): Promise<Misfit<MisfitValuesType>|undefined> {
    if (typeof property == 'string') {
      let value = (obj as any)[property]

      if (doNotValidateIfUndefined && value === undefined) {
        return
      }
    
      let misfit = await validateValue(value)
      if (misfit && misfit.constraint == undefined) {
        misfit.constraint = this.name
      }

      return misfit
    }
    else if (property instanceof Array) {
      let misfit
      let everyValueAbsent = true

      for (let fld of property) {
        let value = (obj as any)[fld]

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
      throw new Error('Parameter property was neither of type string nor instance of Array')
    }
  }
}
