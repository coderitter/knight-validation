import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Unique from '../../src/lib/constraints/Unique'

describe('constraints', function() {
  describe('Unqiue', function() {
    describe('validate', function() {
      it('should return undefined if unique', function() {
        let unique = new Unique(() => true)
        let misfit = unique.validate(undefined)
        expect(misfit).to.be.undefined
      })

      it('should return undefined if unique', function() {
        let unique = new Unique(() => false)
        let misfit = unique.validate(undefined)
        expect(misfit).to.be.instanceOf(Misfit)
      })
    })
  })
})
