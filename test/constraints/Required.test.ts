import { expect } from 'chai'
import 'mocha'
import { Misfit, Required } from '../../src'

describe('constraints', function() {
  describe('Required', function() {
    describe('validate', function() {
      it('should return a misfit on undefined', async function() {
        let required = new Required
        let misfit = await required.validate(undefined)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on null', async function() {
        let required = new Required
        let misfit = await required.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on empty string', async function() {
        let required = new Required
        let misfit = await required.validate('')
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on NaN', async function() {
        let required = new Required
        let misfit = await required.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should return a misfit on empty object', async function() {
        let required = new Required
        let misfit = await required.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
      })
  
      it('should not return a misfit on number', async function() {
        let required = new Required
        let misfit = await required.validate(1)
        expect(misfit).to.be.undefined
      })
  
      it('should not return a misfit on boolean', async function() {
        let required = new Required
        expect(await required.validate(true)).to.be.undefined
        expect(await required.validate(false)).to.be.undefined
      })
  
      it('should not return a misfit on string', async function() {
        let required = new Required
        let misfit = await required.validate('a')
        expect(misfit).to.be.undefined
      })
  
      it('should not return a misfit on object', async function() {
        let required = new Required
        let misfit = await required.validate({ a: 'a' })
        expect(misfit).to.be.undefined
      })
    })
  })
})