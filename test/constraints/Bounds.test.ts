import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Bounds } from '../../src'

describe('constraints', function () {
  describe('Bounds', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let bounds = new Bounds({ 
          greaterThan: 1,
          greaterThanEqual: 2,
          lesserThan: 3,
          lesserThanEqual: 4,
          minFits: 5,
          maxFits: 6, 
          exactFits: 7 
        })
        expect(bounds.greaterThan).to.equal(1)
        expect(bounds.greaterThanEqual).to.equal(2)
        expect(bounds.lesserThan).to.equal(3)
        expect(bounds.lesserThanEqual).to.equal(4)
        expect(bounds.minFits).to.equal(5)
        expect(bounds.maxFits).to.equal(6)
        expect(bounds.exactFits).to.equal(7)
      })
    })

    describe('validate', function () {
      it('should return a misfit if a number is not greater than', async function () {
        let max = new Bounds({ greaterThan: 5 })
        let misfit = await max.validate(5)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if a number is greater than', async function () {
        let max = new Bounds({ greaterThan: 5 })
        let misfit = await max.validate(6)
        expect(misfit).to.be.null
      })

      it('should return a misfit if a number is not greater than equal', async function () {
        let max = new Bounds({ greaterThanEqual: 5 })
        let misfit = await max.validate(4)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if a number is greater than equal', async function () {
        let max = new Bounds({ greaterThanEqual: 5 })
        let misfit = await max.validate(5)
        expect(misfit).to.be.null
      })

      it('should return a misfit if a number is not lesser than', async function () {
        let max = new Bounds({ lesserThan: 5 })
        let misfit = await max.validate(5)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if a number is lesser than', async function () {
        let max = new Bounds({ lesserThan: 5 })
        let misfit = await max.validate(4)
        expect(misfit).to.be.null
      })

      it('should return a misfit if a number is not lesser than equal', async function () {
        let max = new Bounds({ lesserThanEqual: 5 })
        let misfit = await max.validate(6)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should not return a misfit if a number is lesser than equal', async function () {
        let max = new Bounds({ lesserThanEqual: 5 })
        let misfit = await max.validate(5)
        expect(misfit).to.be.null
      })

      it('should not return a misfit for not supported types', async function () {
        let max = new Bounds({ lesserThan: 5, greaterThan: 2 })
        expect(await max.validate(true)).to.be.null
        expect(await max.validate({})).to.be.null
        expect(await max.validate(undefined)).to.be.null
        expect(await max.validate(null)).to.be.null
        expect(await max.validate(new Date)).to.be.null
        expect(await max.validate(NaN)).to.be.null
      })
    })
  })
})
