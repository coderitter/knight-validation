import { Misfit } from 'knight-misfit'
import { DotNotation } from './DotNotation'

export interface ConstraintMisfitValues {
  minFits?: number
  maxFits?: number
  exactFits?: number
  misfits?: Misfit[]
}

export abstract class Constraint<T = any, MisfitValuesType = ConstraintMisfitValues> {
  
  name: string = this.constructor.name
  minFits?: number
  maxFits?: number
  exactFits?: number
  
  async validate(value: T): Promise<Misfit<MisfitValuesType>|null> {
    return null
  }
  
  async validateMultipleProperties(object: any, properties: string[]): Promise<Misfit<MisfitValuesType>|null> {
    let misfits: Misfit[] = []

    for (let property of properties) {
      let dotNotification = new DotNotation(property)
      let value = dotNotification.get(object)
      let misfit = await this.validate(value)

      if (misfit != null) {
        misfits.push(misfit)
      }
    }

    let fits = properties.length - misfits.length

    if (this.exactFits != undefined) {
      if (fits != this.exactFits) {
        return new Misfit<MisfitValuesType>(this.name + 'ExactFits', undefined, {
          atLeastFits: this.minFits,
          atMostFits: this.maxFits,
          exactFits: this.exactFits,
          misfits: misfits
        } as any)
      }
    }

    else if (this.minFits != undefined && this.maxFits != undefined) {
      if (fits < this.minFits || fits > this.maxFits) {
        return new Misfit<MisfitValuesType>(this.name + 'MinAndMaxFits', undefined, {
          atLeastFits: this.minFits,
          atMostFits: this.maxFits,
          exactFits: this.exactFits,
          misfits: misfits
        } as any)
      }
    }

    else if (this.minFits != undefined) {
      if (fits < this.minFits) {
        return new Misfit<MisfitValuesType>(this.name + 'MinFits', undefined, {
          atLeastFits: this.minFits,
          atMostFits: this.maxFits,
          exactFits: this.exactFits,
          misfits: misfits
        } as any)
      }
    }

    else if (this.maxFits != undefined) {
      if (fits > this.maxFits) {
        return new Misfit<MisfitValuesType>(this.name + 'MaxFits', undefined, {
          atLeastFits: this.minFits,
          atMostFits: this.maxFits,
          exactFits: this.exactFits,
          misfits: misfits
        } as any)
      }
    }

    else if (misfits.length > 0) {
      return new Misfit<MisfitValuesType>(this.name, undefined, {
          atLeastFits: this.minFits,
          atMostFits: this.maxFits,
          exactFits: this.exactFits,
          misfits: misfits
        } as any)
    }

    return null
  }
}
