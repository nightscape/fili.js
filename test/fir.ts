/* global it, describe, before, after */

'use strict'

/* eslint-disable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should')
/* eslint-enable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var FirCoeffs = require('../src/firCoeffs')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var FirFilter = require('../src/firFilter')

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('iir.js', function () {
  var firCalculator: any

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
  before(function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    firCalculator = new FirCoeffs()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(function () {})

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fir-lp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.lowpass({
        order: 100,
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fir-hp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.highpass({
        order: 100,
        Fs: 4000,
        Fc: 1457
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fir-br', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.bandstop({
        order: 100,
        Fs: 4000,
        F1: 457,
        F2: 1457
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fir-bp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.bandpass({
        order: 100,
        Fs: 4000,
        F1: 577,
        F2: 1111
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('fir-kb-bp', function () {
      var filterCoeffs: any, filter: any
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can calculate coeffs', function () {
        filterCoeffs = firCalculator.kbFilter({
          order: 101,
          Fs: 4000,
          Fa: 577,
          Fb: 1111,
          Att: 100
        })
        filterCoeffs.should.be.an.Array
        filterCoeffs[44].should.be.a.Number
        filterCoeffs.length.should.equal(101)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can generate a filter', function () {
        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        filter = new FirFilter(filterCoeffs)
        filter.should.be.an.Object
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can do a single step', function () {
        var out = filter.singleStep(10)
        out.should.be.a.Number
        out.should.not.equal(0)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can do multiple steps', function () {
        var simInput = []
        for (var i = 0; i < 10000; i++) {
          simInput.push(i % 10 - 5)
        }
        var out = filter.multiStep(simInput)
        out.should.be.an.Array
        out.length.should.equal(10000)
        out[111].should.not.equal(simInput[111])
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can simulate multiple steps', function () {
        var simInput = []
        for (var i = 0; i < 10000; i++) {
          simInput.push(i % 10 - 5)
        }
        var out = filter.simulate(simInput)
        out.should.be.an.Array
        out.length.should.equal(10000)
        out[111].should.not.equal(simInput[111])
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('calculates filter response', function () {
        var r = filter.response(200)
        r.should.be.an.Array
        r.length.should.equal(200)
        r[20].should.be.an.Object
        r[20].magnitude.should.be.a.Number
        r[20].dBmagnitude.should.be.a.Number
        r[20].phase.should.be.a.Number
        r[20].unwrappedPhase.should.be.a.Number
        r[20].phaseDelay.should.be.a.Number
        r[20].groupDelay.should.be.a.Number

        r[20].magnitude.should.not.equal(0)
        r[20].dBmagnitude.should.not.equal(0)
        r[20].phase.should.not.equal(0)
        r[20].unwrappedPhase.should.not.equal(0)
        r[20].phaseDelay.should.not.equal(0)
        r[20].groupDelay.should.not.equal(0)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fir-helpers', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can get available filters', function () {
      var av = firCalculator.available()
      av.length.should.not.equal(0)
      av[1].should.be.a.String
    })
  })
})
