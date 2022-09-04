import { expect } from 'chai'
import 'mocha'
import { Misfit, TypeOf, TypeOfMisfitValues } from '../../src'

describe('constraints', function() {
  describe('TypeOf', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate(1)
          expect(misfit).to.be.null
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new TypeOf('number')
  
          expect(await typeOf.validate(undefined)).to.be.null
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new TypeOf('number')
          let misfit = await typeOf.validate('1')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'string' } as TypeOfMisfitValues)

          expect(await typeOf.validate(null)).to.be.instanceOf(Misfit)
          expect(await typeOf.validate('')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate(NaN)).to.be.null
        })  

        it('should return a misfit if the wrong class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate(1)
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal({ types: ['Date'], actual: 'number' } as TypeOfMisfitValues)
        })  

        it('should not return a misfit if the correct class', async function() {
          let typeOf = new TypeOf(Date)
          let misfit = await typeOf.validate(new Date)
          expect(misfit).to.be.null
        })

        it('should not return a misfit if one of the types fit', async function() {
          let typeOf = new TypeOf('number', null, Date)
          let misfit = await typeOf.validate(null)
          expect(misfit).to.be.null
        })

        it('should return a misfit if none of the types fit', async function() {
          let typeOf = new TypeOf('number', null, Date)
          let misfit = await typeOf.validate(false)
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.values).to.deep.equal({ types: ['number', null, 'Date'], actual: 'boolean' } as TypeOfMisfitValues)
        })
      })
    })
  })
})
