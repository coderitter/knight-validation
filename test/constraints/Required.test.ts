import { expect } from 'chai'
import 'mocha'
import { Misfit, Required } from '../../src'

describe('constraints', function() {
  describe('Required', function() {
    describe('validate', function() {
      it('should return a misfit on undefined', function() {
        let required = new Required
        let misfit = required.validate(undefined)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on null', function() {
        let required = new Required
        let misfit = required.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on empty string', function() {
        let required = new Required
        let misfit = required.validate('')
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on NaN', function() {
        let required = new Required
        let misfit = required.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on empty object', function() {
        let required = new Required
        let misfit = required.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should not return a misfit on boolean', function() {
        let required = new Required
        expect(required.validate(true)).to.be.undefined
        expect(required.validate(false)).to.be.undefined
      })
  
      it('should not return a misfit on string', function() {
        let required = new Required
        let misfit = required.validate('a')
        expect(misfit).to.be.undefined
      })
  
      it('should not return a misfit on object', function() {
        let required = new Required
        let misfit = required.validate({ a: 'a' })
        expect(misfit).to.be.undefined
      })
    })
  })
})