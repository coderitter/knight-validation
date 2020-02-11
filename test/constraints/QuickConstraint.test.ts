import 'mocha'
import { QuickConstraint, Misfit } from '../../src'
import { expect } from 'chai'

describe('QuickConstraint', function() {
  describe('validate', function() {
    it('should use the given validate function', async function() {
      let constraint = new QuickConstraint('TestConstraint', async (value: any, obj: any) => {
        return new Misfit('M1')
      })

      let result = await constraint.validate('a', { a: 'a' })

      expect(result).to.be.not.undefined
      expect(result?.name).to.equal('M1')
    })

    it('should give the misfit the name of the constraint if the misfit has no name', async function() {
      let constraint = new QuickConstraint('TestConstraint', async (value: any, obj: any) => {
        return new Misfit
      })

      let result = await constraint.validate('a', { a: 'a' })

      expect(result).to.be.not.undefined
      expect(result?.name).to.equal('TestConstraint')
    })
  })
})