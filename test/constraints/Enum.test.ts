import { expect } from 'chai'
import 'mocha'
import { Enum, Misfit, TypeOf } from '../../src'

describe('constraints', function() {
  describe('Enum', function() {
    describe('validate', function() {
      describe('single field', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ value: 'a' }, 'value')
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new Enum(['a', 'b'])
  
          expect(await typeOf.validate({ value: undefined }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: null }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: '' }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: NaN }, 'value')).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ value: '1' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })  
      })

      describe('field combination', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ a: 'a', b: 'b' }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new TypeOf('number')
  
          expect(await typeOf.validate({ a: undefined, b: undefined }, ['a', 'b'])).to.be.undefined
          expect(await typeOf.validate({ a: null, b: null }, ['a', 'b'])).to.be.undefined
          expect(await typeOf.validate({ a: '', b: '' }, ['a', 'b'])).to.be.undefined
          expect(await typeOf.validate({ a: NaN, b: NaN }, ['a', 'b'])).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ a: 'a', b: '2' }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
      })
    })
  })
})
