import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../src'

describe('Misfit', function() {
  describe('constructor', function() {
    it('should accept a field and a name', function() {
      let misfit = new Misfit('field', 'name')

      expect(misfit.field).to.equal('field')
      expect(misfit.name).to.equal('name')
      expect(misfit.constraints).to.be.undefined
    })

    it('should accept a name', function() {
      let misfit = new Misfit('name')

      expect(misfit.field).to.be.undefined
      expect(misfit.name).to.equal('name')
      expect(misfit.constraints).to.be.undefined
    })

    it('should accept a field, a name and constraints', function() {
      let misfit = new Misfit('field', 'name', { a: 'a' })

      expect(misfit.field).to.equal('field')
      expect(misfit.name).to.equal('name')
      expect(misfit.constraints).to.deep.equal({ a: 'a' })
    })

    it('should accept a name and constraints', function() {
      let misfit = new Misfit('name', { a: 'a'})

      expect(misfit.field).to.be.undefined
      expect(misfit.name).to.equal('name')
      expect(misfit.constraints).to.deep.equal({ a: 'a' })
    })
  })
})