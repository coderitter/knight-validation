import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Exists from '../../src/lib/constraints/Exists'

describe('constraints', function() {
  describe('Exists', function() {
    describe('validate', function() {
      it('should return undefined if exists', async function() {
        let exists = new Exists(async () => true)
        let misfit = await exists.validate(undefined)
        expect(misfit).to.be.undefined
      })

      it('should return a misfit if not exists', async function() {
        let exists = new Exists(async () => false)
        let misfit = await exists.validate(undefined)
        expect(misfit).to.be.instanceOf(Misfit)
      })
    })
  })
})
