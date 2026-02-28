import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Constraint, ConstraintMisfitValues } from '../src'

interface TestConstraintMisfitValues extends ConstraintMisfitValues {
  value: number
}

class TestConstraint extends Constraint<number, TestConstraintMisfitValues> {
  constructor(params?: Partial<TestConstraint>) {
    super(TestConstraint.name)
    Object.assign(this, params)
  }

  async validate(value: number): Promise<Misfit<TestConstraintMisfitValues> | null> {
    return value % 2 ? null : new Misfit('TestConstraint', undefined, { value: value })
  }
}

describe('Constraint', function() {
  describe('validateMultipleProperties', function() {
    it('should return a misfit if not the exact amount of properties fit', async function() {
      let constraint = new TestConstraint({ exactFits: 2 })
      
      let misfit = await constraint.validateMultipleProperties({ a: 1, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(0)
      
      misfit = await constraint.validateMultipleProperties({ a: 0, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(2)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 4 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(3)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)
      expect(misfit!.values!.misfits![2].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![2].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![2].values).to.be.not.undefined
      expect((misfit!.values!.misfits![2].values as TestConstraintMisfitValues).value).to.equal(4)
    })

    it('should return a misfit if not a minimum amount and a maximum amount of properties fit', async function() {
      let constraint = new TestConstraint({ minFits: 1, maxFits: 2 })
      
      let misfit = await constraint.validateMultipleProperties({ a: 1, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(0)
      
      misfit = await constraint.validateMultipleProperties({ a: 0, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 4 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(3)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)
      expect(misfit!.values!.misfits![2].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![2].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![2].values).to.be.not.undefined
      expect((misfit!.values!.misfits![2].values as TestConstraintMisfitValues).value).to.equal(4)
    })

    it('should return a misfit if not a minimum amount of properties fit', async function() {
      let constraint = new TestConstraint({ minFits: 2 })
      
      let misfit = await constraint.validateMultipleProperties({ a: 1, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null
      
      misfit = await constraint.validateMultipleProperties({ a: 0, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(2)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 4 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(3)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)
      expect(misfit!.values!.misfits![2].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![2].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![2].values).to.be.not.undefined
      expect((misfit!.values!.misfits![2].values as TestConstraintMisfitValues).value).to.equal(4)
    })

    it('should return a misfit if not a maximum amount of properties fit', async function() {
      let constraint = new TestConstraint({ maxFits: 2 })
      
      let misfit = await constraint.validateMultipleProperties({ a: 1, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(0)
      
      misfit = await constraint.validateMultipleProperties({ a: 0, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 4 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null
    })

    it('should return a misfit if not every property fits', async function() {
      let constraint = new TestConstraint
      
      let misfit = await constraint.validateMultipleProperties({ a: 0, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(1)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(2)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)

      misfit = await constraint.validateMultipleProperties({ a: 0, b: 2, c: 4 }, ['a', 'b', 'c'])
      expect(misfit).to.be.not.null
      expect(misfit!.constraint).to.equal('TestConstraint')
      expect(misfit!.values).to.be.not.undefined
      expect(misfit!.values!.misfits).to.be.not.undefined
      expect(misfit!.values!.misfits!.length).to.equal(3)
      expect(misfit!.values!.misfits![0].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![0].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![0].values).to.be.not.undefined
      expect((misfit!.values!.misfits![0].values as TestConstraintMisfitValues).value).to.equal(0)
      expect(misfit!.values!.misfits![1].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![1].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![1].values).to.be.not.undefined
      expect((misfit!.values!.misfits![1].values as TestConstraintMisfitValues).value).to.equal(2)
      expect(misfit!.values!.misfits![2].constraint).to.be.not.undefined
      expect(misfit!.values!.misfits![2].constraint).to.equal('TestConstraint')
      expect(misfit!.values!.misfits![2].values).to.be.not.undefined
      expect((misfit!.values!.misfits![2].values as TestConstraintMisfitValues).value).to.equal(4)
    })

    it('should not return a misfit if every property fits', async function() {
      let constraint = new TestConstraint
      
      let misfit = await constraint.validateMultipleProperties({ a: 1, b: 3, c: 5 }, ['a', 'b', 'c'])
      expect(misfit).to.be.null
    })
  })
})
