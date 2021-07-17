import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import TypeOf, { TypeOfValues } from '../../src/lib/constraints/TypeOf'

describe('constraints', function() {
  describe('TypeOf', function() {
    describe('validate', function() {
      describe('single field', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ value: 1 }, 'value')
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new TypeOf('number')
  
          expect(await typeOf.validate({ value: undefined }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: null }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: '' }, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: NaN }, 'value')).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ value: '1' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal(<TypeOfValues> { actualType: 'string', expectedType: 'number' })
        })  

        it('should return a misfit if the wrong class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ value: {} }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal(<TypeOfValues> { actualType: 'object', expectedType: 'Date' })
        })  

        it('should not return a misfit if the correct class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ value: new Date }, 'value')
          expect(misfit).to.be.undefined
        })  
      })

      describe('field combination', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ a: 1, b: 2 }, ['a', 'b'])
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
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ a: '1', b: '2' }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal(<TypeOfValues> { actualType: 'string', expectedType: 'number' })
        })

        it('should return a misfit if the wrong class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ a: new Date, b: {} }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal(<TypeOfValues> { actualType: 'object', expectedType: 'Date' })
        })  

        it('should not return a misfit if the correct class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ a: new Date, b: new Date }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
      })
    })
  })
})
