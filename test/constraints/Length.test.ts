import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Length } from '../../src'

describe('constraints', function () {
  describe('Length', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let length = new Length({ 
          min: 1,
          max: 2,
          exact: 3,
          minFits: 4,
          maxFits: 5, 
          exactFits: 6 
        })
        expect(length.min).to.equal(1)
        expect(length.max).to.equal(2)
        expect(length.exact).to.equal(3)
        expect(length.minFits).to.equal(4)
        expect(length.maxFits).to.equal(5)
        expect(length.exactFits).to.equal(6)
      })
    })

    describe('validate', function () {
      it('should return a misfit if the length of a string is below the minimum', async function () {
        let max = new Length({ min: 5 })
        let misfit = await max.validate('1234')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if the length of a string is above the minimum', async function () {
        let max = new Length({ min: 5 })
        let misfit = await max.validate('12345')
        expect(misfit).to.be.null
      })

      it('should return a misfit if the length of a string is above the maximum', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate('123456')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit  if the length of a string is below the maximum', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate('12345')
        expect(misfit).to.be.null
      })

      it('should return a misfit if the length of a string is not exact', async function () {
        let max = new Length({ exact: 5 })

        let misfit = await max.validate('1234')
        expect(misfit).to.be.instanceOf(Misfit)

        misfit = await max.validate('123456')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit  if the length of a string is exact', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate('12345')
        expect(misfit).to.be.null
      })

      it('should return a misfit if the length of an array is below the minimum', async function () {
        let max = new Length({ min: 5 })
        let misfit = await max.validate([1, 2, 3, 4])
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if the length of an array is above the minimum', async function () {
        let max = new Length({ min: 5 })
        let misfit = await max.validate([1, 2, 3, 4, 5])
        expect(misfit).to.be.null
      })

      it('should return a misfit if the length of an array is above the maximum', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate([1, 2, 3, 4, 5, 6])
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit  if the length of an array is below the maximum', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate([1, 2, 3, 4, 5])
        expect(misfit).to.be.null
      })

      it('should return a misfit if the length of an array is not exact', async function () {
        let max = new Length({ exact: 5 })

        let misfit = await max.validate([1, 2, 3, 4])
        expect(misfit).to.be.instanceOf(Misfit)

        misfit = await max.validate([1, 2, 3, 4, 5, 6])
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit  if the length of an array is exact', async function () {
        let max = new Length({ max: 5 })
        let misfit = await max.validate([1, 2, 3, 4, 5])
        expect(misfit).to.be.null
      })
    })
  })
})
