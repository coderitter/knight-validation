import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../src'

describe('Misfit', function() {
  describe('constructor', function() {
    it('should accept a field and a name', function() {
      let misfit = new Misfit('field', 'name')

      expect(misfit.field).to.equal('field')
      expect(misfit.name).to.equal('name')
    })

    it('should accept a name', function() {
      let misfit = new Misfit('name')

      expect(misfit.field).to.be.undefined
      expect(misfit.name).to.equal('name')
    })
  })
})