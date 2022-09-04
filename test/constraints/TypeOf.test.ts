import { expect } from 'chai'
import 'mocha'
import { Misfit, TypeOf, TypeOfConstraints } from '../../src'

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
  
          expect(await typeOf.validate({ value: undefined }, 'value')).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ value: '1' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { types: ['number'] })

          expect(await typeOf.validate({ value: null }, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: '' }, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: NaN }, 'value')).to.be.undefined
        })  

        it('should return a misfit if the wrong class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ value: 1 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { types: ['Date'] })
        })  

        it('should not return a misfit if the correct class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ value: new Date }, 'value')
          expect(misfit).to.be.undefined
        })

        it('should not return a misfit if one of the types fit', async function() {
          let typeOf = new TypeOf('number', null, Date)
          let misfit = await typeOf.validate({ value: null }, 'value')
          expect(misfit).to.be.undefined
        })

        it('should return a misfit if none of the types fit', async function() {
          let typeOf = new TypeOf('number', null, Date)
          let misfit = await typeOf.validate({ value: false }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { types: ['number', null, 'Date'] })
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
          expect(await typeOf.validate({ a: undefined, b: undefined }, ['a', 'b'])).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate({ a: '1', b: '2' }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { types: ['number'] })

          expect(await typeOf.validate({ a: null, b: null }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ a: '', b: '' }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ a: NaN, b: NaN }, ['a', 'b'])).to.be.undefined
        })

        it('should return a misfit if the wrong class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate({ a: new Date, b: 1 }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { types: ['Date'] })
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
