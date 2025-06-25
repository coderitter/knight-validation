import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Enum } from '../../src'

describe('constraints', function() {
  describe('Enum', function() {
    describe('constructor', function() {
      it('should accept an array of values', function() {
        let e = new Enum(['a', 'b'])
        expect(e.values).to.deep.equal(['a', 'b'])
      })

      it('should accept the values individually', function() {
        let e = new Enum('a', 'b')
        expect(e.values).to.deep.equal(['a', 'b'])
      })

      it('should accept the values of an TypeScript enum using string values', function() {
        let e = new Enum(StringEnum)
        expect(e.values).to.deep.equal(['A', 'B'])
      })

      it('should accept the values of an TypeScript enum using number values', function() {
        let e = new Enum(NumberEnum)
        expect(e.values).to.deep.equal([1, 2])
      })

      it('should accept the values of an TypeScript enum using mixed values', function() {
        let e = new Enum(MixedEnum)
        expect(e.values).to.deep.equal(['A', 2])
      })
    })

    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate('a')
          expect(misfit).to.be.null
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new Enum(['a', 'b'])
  
          expect(await typeOf.validate(undefined)).to.be.null
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new Enum(['a', 'b'])
          expect(await typeOf.validate('1')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate(null)).to.be.instanceOf(Misfit)
          expect(await typeOf.validate('')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate(NaN)).to.be.instanceOf(Misfit)
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using string values', async function() {
          let typeOf = new Enum(StringEnum)
          let misfit = await typeOf.validate('C')
          expect(misfit).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using string values', async function() {
          let typeOf = new Enum(StringEnum)
          let misfit = await typeOf.validate('A')
          expect(misfit).to.be.null
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using number values', async function() {
          let typeOf = new Enum(NumberEnum)
          expect(await typeOf.validate('3')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate('a')).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using number values', async function() {
          let typeOf = new Enum(NumberEnum)
          let misfit = await typeOf.validate(1)
          expect(misfit).to.be.null
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using mixed values', async function() {
          let typeOf = new Enum(MixedEnum)
          expect(await typeOf.validate('3')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate('a')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate('C')).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using mixed values', async function() {
          let typeOf = new Enum(MixedEnum)
          expect(await typeOf.validate('A')).to.be.null
          expect(await typeOf.validate(2)).to.be.null
        })
      })
    })
  })
})

enum StringEnum {
  a = 'A', b = 'B'
}

enum NumberEnum {
  a = 1, b
}

enum MixedEnum {
  a = 'A', b = 2
}