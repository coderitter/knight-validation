import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Unique from '../../src/lib/constraints/Unique'

describe('constraints', function() {
  describe('Unqiue', function() {
    describe('validate', function() {
      it('should return undefined if unique', async function() {
        let unique = new Unique(async () => true)
        let misfit = await unique.validate(undefined)
        expect(misfit).to.be.undefined
      })

      it('should return a misfit if not unique', async function() {
        let unique = new Unique(async () => false)
        let misfit = await unique.validate(undefined)
        expect(misfit).to.be.instanceOf(Misfit)
      })
    })
  })
})
