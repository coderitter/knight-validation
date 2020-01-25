import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../src'

describe('Misfit', function() {
  describe('constructor', function() {
    it('should accept a field and a code', function() {
      let misfit = new Misfit('field', 'code')

      expect(misfit.field).to.equal('field')
      expect(misfit.code).to.equal('code')
    })

    it('should accept a code', function() {
      let misfit = new Misfit('code')

      expect(misfit.field).to.be.undefined
      expect(misfit.code).to.equal('code')
    })
  })
})