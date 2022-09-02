import { expect } from 'chai'
import 'mocha'
import { Misfit, Required } from '../../src'

describe('constraints', function() {
  describe('Required', function() {
    describe('validate', function() {
      describe('singe field', function() {
        it('should return a misfit on undefined', async function() {
          let required = new Required
          let misfit = await required.validate({ value: undefined }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit on null', async function() {
          let required = new Required
          let misfit = await required.validate({ value: null }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on empty string', async function() {
          let required = new Required
          let misfit = await required.validate({ value: '' }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on NaN', async function() {
          let required = new Required
          let misfit = await required.validate({ value: NaN }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on number', async function() {
          let required = new Required
          let misfit = await required.validate({ value: 1 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on boolean', async function() {
          let required = new Required
          expect(await required.validate({ value: true }, 'value')).to.be.undefined
          expect(await required.validate({ value: false }, 'value')).to.be.undefined
        })
    
        it('should not return a misfit on string', async function() {
          let required = new Required
          let misfit = await required.validate({ value: 'a' }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on object', async function() {
          let required = new Required
          let misfit = await required.validate({ value: {} }, 'value')
          expect(misfit).to.be.undefined
        })
      })

      describe('field combination', function() {
        it('should return a misfit on undefined', async function() {
          let required = new Required
          let misfit = await required.validate({ a: undefined, b: undefined }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit on null', async function() {
          let required = new Required
          let misfit = await required.validate({ a: null, b: null }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on empty string', async function() {
          let required = new Required
          let misfit = await required.validate({ a: '', b: '' }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on NaN', async function() {
          let required = new Required
          let misfit = await required.validate({ a: NaN, b: NaN }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on number', async function() {
          let required = new Required
          let misfit = await required.validate({ a: 1, b: 2 }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on boolean', async function() {
          let required = new Required
          expect(await required.validate({ a: true, b: true }, ['a', 'b'])).to.be.undefined
          expect(await required.validate({ a: false, b: false }, ['a', 'b'])).to.be.undefined
        })
    
        it('should not return a misfit on string', async function() {
          let required = new Required
          let misfit = await required.validate({ a: 'a', b: 'b' }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit on object', async function() {
          let required = new Required
          let misfit = await required.validate({ a: {}, b: {} }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })  
      })
    })
  })
})

class EmptyClass {}