import { expect } from 'chai'
import 'mocha'
import { Misfit, QuickConstraint } from '../src'

describe('QuickConstraint', function() {
  describe('validate', function() {
    it('should use the given validate function', async function() {
      let constraint = new QuickConstraint('TestConstraint', async (obj: any) => {
        return new Misfit('M1')
      })

      let misfit = await constraint.validate('a')

      expect(misfit).to.be.instanceOf(Misfit)
      expect(misfit?.constraint).to.equal('M1')
    })

    it('should use the given validate multiple properties function', async function() {
      let constraint = new QuickConstraint('TestConstraint', undefined, async (obj: any, properties: string[]) => {
        if (properties.length != 2 || properties[0] != 'a' || properties[1] != 'b') {
          return new Misfit('Given properties array was wrong')
        }

        return new Misfit('M1')
      })

      let misfit = await constraint.validateMultipleProperties({ a: 'a', b: 'b'}, ['a', 'b'])

      expect(misfit).to.be.instanceOf(Misfit)
      expect(misfit?.constraint).to.equal('M1')
    })

    it('should use the default validate multiple properties function if no one was set', async function() {
      let constraint = new QuickConstraint('TestConstraint', async (obj: any) => {
        return new Misfit('M1')
      })

      let misfit = await constraint.validateMultipleProperties({ a: 'a', b: 'b'}, ['a', 'b'])

      expect(misfit).to.be.instanceOf(Misfit)
      expect(misfit?.constraint).to.equal('TestConstraint')
      expect(misfit?.values).to.be.not.undefined
      expect(misfit?.values.misfits).to.be.not.undefined
      expect(misfit?.values.misfits.length).to.equal(2)
      expect(misfit?.values.misfits[0].constraint).to.equal('M1')
      expect(misfit?.values.misfits[1].constraint).to.equal('M1')
    })

    it('should give the misfit the name of the constraint if the misfit has no name', async function() {
      let constraint = new QuickConstraint('TestConstraint', async (obj: any) => {
        return new Misfit('TestConstraint')
      })

      let misfit = await constraint.validate('a')

      expect(misfit).to.be.instanceOf(Misfit)
      expect(misfit?.constraint).to.equal('TestConstraint')
    })
  })
})
