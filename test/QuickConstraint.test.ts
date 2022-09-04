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
