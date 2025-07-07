import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Absent } from '../../src'

describe('constraints', function () {
  describe('Absent', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let absent = new Absent({ minFits: 1, maxFits: 2, exactFits: 3 })
        expect(absent.minFits).to.equal(1)
        expect(absent.maxFits).to.equal(2)
        expect(absent.exactFits).to.equal(3)
      })
    })

    describe('validate', function () {
      it('should not return a misfit on undefined', async function () {
        let absent = new Absent
        let misfit = await absent.validate(undefined)
        expect(misfit).to.be.null
      })

      it('should return a misfit on null', async function () {
        let absent = new Absent
        let misfit = await absent.validate(null)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on empty string', async function () {
        let absent = new Absent
        let misfit = await absent.validate('')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on NaN', async function () {
        let absent = new Absent
        let misfit = await absent.validate(NaN)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on number', async function () {
        let absent = new Absent
        let misfit = await absent.validate(1)
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on boolean', async function () {
        let absent = new Absent
        expect(await absent.validate(true)).to.be.instanceOf(Misfit)
        expect(await absent.validate(false)).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on string', async function () {
        let absent = new Absent
        let misfit = await absent.validate('')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a misfit on object', async function () {
        let absent = new Absent
        let misfit = await absent.validate({})
        expect(misfit).to.be.instanceOf(Misfit)
      })
    })
  })
})
