import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Absent extends Constraint {

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    if (typeof field == 'string') {
      let value = obj[field]

      if (! Constraint.absent(value)) {
        return new Misfit
      }
    }
    else if (field instanceof Array) {
      for (let fld of field) {
        let value = obj[fld]

        if (! Constraint.absent(value)) {
          return new Misfit
        }
      }
    }
    else {
      throw new Error('Parameter field was neither of type string nor instance of Array')
    }
  }
}