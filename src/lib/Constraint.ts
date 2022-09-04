import { Misfit } from './Misfit'

export abstract class Constraint<T = any, MisfitValuesType = any> {

  name: string = this.constructor.name

  abstract validate(obj: T, properties: string|string[]): Promise<Misfit<MisfitValuesType>|null>

  protected async defaultValidation(obj: T, properties: string|string[], validateValue: (value: any) => Promise<Misfit<MisfitValuesType>|null>, doNotValidateIfUndefined = true): Promise<Misfit<MisfitValuesType>|null> {
    if (doNotValidateIfUndefined && this.arePropertiesAbsent(obj, properties)) {
      return null
    }

    let misfit: Misfit|null = null

    if (typeof properties == 'string') {
      let value = (obj as any)[properties]
      misfit = await validateValue(value)
    }
    else if (properties instanceof Array) {
      for (let property of properties) {
        let value = (obj as any)[property]

        if (doNotValidateIfUndefined && value === undefined) {
          continue
        }

        misfit = await validateValue(value)

        if (misfit) {
          break
        }
      }
    }
    else {
      throw new Error('Parameter property was neither of type string nor instance of Array')
    }

    if (misfit && misfit.constraint == undefined) {
      misfit.constraint = this.name
    }

    if (misfit && (! misfit.properties || misfit.properties.length == 0)) {
      misfit.setProperties(properties)
    }

    return misfit
  }

  arePropertiesAbsent(obj: T, properties: string|string[]): boolean {
    if (typeof properties == 'string') {
      return (obj as any)[properties] === undefined
    }
    else {
      for (let property of properties) {
        if ((obj as any)[property] !== undefined) {
          return false
        }
      }

      return true
    }
  }
}
