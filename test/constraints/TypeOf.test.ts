import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { TypeOf, TypeOfMisfitValues } from '../../src'

describe('constraints', function () {
  describe('TypeOf', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let typeOf = new TypeOf('string', TypeOf, null, { minFits: 1, maxFits: 2, exactFits: 3 })
        expect(typeOf.types).to.deep.equal(['string', TypeOf, null])
        expect(typeOf.minFits).to.equal(1)
        expect(typeOf.maxFits).to.equal(2)
        expect(typeOf.exactFits).to.equal(3)
      })
    })

    describe('validate', function () {
      it('should return undefined if correct type', async function () {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate(1)
        expect(misfit).to.be.null
      })

      it('should return undefined when the value is undefined', async function () {
        let typeOf = new TypeOf('number')
        expect(await typeOf.validate(undefined)).to.be.null
      })

      it('should handle numbers correctly', async function () {
        let typeOf = new TypeOf('number')
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.null

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.null

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: 'Array' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number'], actual: null } as TypeOfMisfitValues)
      })

      it('should handle strings correctly', async function () {
        let typeOf = new TypeOf('string')
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.null

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: 'Array' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['string'], actual: null } as TypeOfMisfitValues)
      })

      it('should handle booleans correctly', async function () {
        let typeOf = new TypeOf('boolean')
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.null

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: 'Array' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['boolean'], actual: null } as TypeOfMisfitValues)
      })

      it('should handle BigInt\'s correctly', async function () {
        let typeOf = new TypeOf('bigint')
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.null

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: 'Array' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['bigint'], actual: null } as TypeOfMisfitValues)
      })

      it('should handle objects correctly', async function () {
        let typeOf = new TypeOf('object')
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.null

        misfit = await typeOf.validate([])
        expect(misfit).to.be.null

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['object'], actual: null } as TypeOfMisfitValues)
      })

      it('should handle null correctly', async function () {
        let typeOf = new TypeOf(null)
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: [null], actual: 'Array' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.null
      })

      it('should handle constructor functions correctly', async function () {
        let typeOf = new TypeOf(Array)
        let misfit: Misfit|null
        
        misfit = await typeOf.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'number' } as TypeOfMisfitValues)

        misfit = await typeOf.validate('string')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'string' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(true)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'boolean' } as TypeOfMisfitValues)

        misfit = await typeOf.validate(BigInt(1))
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'bigint' } as TypeOfMisfitValues)

        misfit = await typeOf.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: 'Object' } as TypeOfMisfitValues)

        misfit = await typeOf.validate([])
        expect(misfit).to.be.null

        misfit = await typeOf.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['Array'], actual: null } as TypeOfMisfitValues)
      })

      it('should not return a misfit if one of the types fit', async function () {
        let typeOf = new TypeOf('number', null, Date)
        let misfit = await typeOf.validate(null)
        expect(misfit).to.be.null
      })

      it('should return a misfit if none of the types fit', async function () {
        let typeOf = new TypeOf('number', null, Date)
        let misfit = await typeOf.validate(false)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.values).to.deep.equal({ types: ['number', null, 'Date'], actual: 'boolean' } as TypeOfMisfitValues)
      })
    })
  })
})
