/* global it, describe, before, after */

'use strict'

/* eslint-disable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should')
/* eslint-enable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var CalcCascades = require('../src/calcCascades')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var IirFilter = require('../src/iirFilter')

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('iir.js', function () {
  var iirCascadeCalculator: any

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
  before(function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    iirCascadeCalculator = new CalcCascades()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(function () {})
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-bessel-bandstop', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.bandstop({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-bessel-lp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      })

      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.not.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-bessel-hp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.highpass({
        order: 2,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(2)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)

      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      })

      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.not.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-butterworth-hp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 2234
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)

      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234,
        preGain: true
      })

      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.not.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-butterworth-lp', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 2,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234
      })
      filterCoeffs.length.should.equal(2)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234,
        preGain: true
      })

      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.not.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-butterworth-bandstop', function () {
    var filterCoeffs: any, filter: any
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.bandstop({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate a filter', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      filter = new IirFilter(filterCoeffs)
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
    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates step response', function () {
      var r = filter.stepResponse(100)
      r.should.be.an.Object
      r.out.should.be.an.Array
      r.out.length.should.equal(100)
      r.min.should.be.an.Object
      r.min.sample.should.be.a.Number
      r.min.value.should.be.a.Number
      r.max.should.be.an.Object
      r.max.sample.should.be.a.Number
      r.max.value.should.be.a.Number
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

      r = filter.response()
      r.should.be.an.Array
      r.length.should.equal(100)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      })
      r.should.be.an.Object
      r.magnitude.should.be.a.Number
      r.dBmagnitude.should.be.a.Number
      r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0)
      r.dBmagnitude.should.not.equal(0)
      r.phase.should.not.equal(0)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-more-filters', function () {
    var filterCoeffs
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Bessel matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Butterworth matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'butterworth',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate allpass matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'allpass',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Tschebyscheff05 matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'tschebyscheff05',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Tschebyscheff1 matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'tschebyscheff1',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Tschebyscheff2 matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'tschebyscheff2',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass Tschebyscheff3 matched-Z', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'tschebyscheff3',
        transform: 'matchedZ',
        Fs: 4000,
        Fc: 500,
        preGain: false
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate allpass bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.allpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate A weighting bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.aweighting({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate highshelf bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.highshelf({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowshelf bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.lowshelf({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate peaking filter bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.peak({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate bandpass bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.bandpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate bandpass Q bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.bandpassQ({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate lowpass BesselThomson bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.lowpassBT({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can calculate highpass BesselThomson bilinear transform', function () {
      filterCoeffs = iirCascadeCalculator.highpassBT({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.length.should.equal(3)
      filterCoeffs[0].should.be.an.Object
      filterCoeffs[1].a.length.should.equal(2)
      filterCoeffs[1].b.length.should.equal(3)
      filterCoeffs[1].z.length.should.equal(2)
      filterCoeffs[1].z[0].should.equal(0)
      filterCoeffs[1].k.should.equal(1)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('iir-helpers', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can get available filters', function () {
      var av = iirCascadeCalculator.available()
      av.length.should.not.equal(0)
      av[1].should.be.a.String
    })
  })
})
