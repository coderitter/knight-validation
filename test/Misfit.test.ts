import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../src'

describe('Misfit', function() {
  describe('constructor', function() {
    it('should accept a field, a code and a message', function() {
      let misfit = new Misfit('field', 'code', 'message')

      expect(misfit.field).to.equal('field')
      expect(misfit.code).to.equal('code')
      expect(misfit.message).to.equal('message')
    })

    it('should accept a code and a message', function() {
      let misfit = new Misfit('code', 'message')

      expect(misfit.field).to.be.undefined
      expect(misfit.code).to.equal('code')
      expect(misfit.message).to.equal('message')
    })
  })
})