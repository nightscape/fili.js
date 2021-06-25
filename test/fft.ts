/* global it, describe, before, after */

'use strict'

/* eslint-disable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should')
/* eslint-enable no-unused-vars */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Fft = require('../src/fft.js')


describe('fft.js', function () {
  var fftCalc: any
  var sinewave: any = []

  
  before(function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    fftCalc = new Fft(8192)
    for (var cnt = 0; cnt < 8192; cnt++) {
      sinewave.push(Math.sin(2 * Math.PI * (113.33232 * cnt / 8192)))
    }
  })

  
  after(function () {})

  
  describe('fft_calc', function () {
    var fftResult: any, magnitude: any
    
    it('can forward', function () {
      fftResult = fftCalc.forward(sinewave, 'hanning')
      fftResult.re.length.should.equal(8192)
      fftResult.im.length.should.equal(8192)
      fftResult.re[133].should.be.a.Number
      fftResult.im[133].should.be.a.Number
    })

    
    it('can calculate the magnitude', function () {
      magnitude = fftCalc.magnitude(fftResult)
      magnitude.length.should.equal(8192)
      magnitude[555].should.be.a.Number
    })

    
    it('can calculate the phase', function () {
      var phase = fftCalc.phase(fftResult)
      phase.length.should.equal(8192)
      phase[1111].should.be.a.Number
    })

    
    it('can calculate the magnitude in dB', function () {
      var magdb = fftCalc.magToDb(magnitude)
      magdb.length.should.equal(8192)
      magdb[888].should.be.a.Number
    })

    
    it('can inverse', function () {
      var original = fftCalc.inverse(fftResult.re, fftResult.im)
      original.length.should.equal(8192)
      original[777].should.be.a.Number
    })

    
    it('can calculate with all window functions', function(this: any) {
      this.timeout(20000)
      var w = fftCalc.windows()
      for (var i = 0; i < w.length; i++) {
        fftResult = fftCalc.forward(sinewave, w[i])
        fftResult.re.length.should.equal(8192)
        fftResult.im.length.should.equal(8192)
        fftResult.re[133].should.be.a.Number
        fftResult.im[133].should.be.a.Number
      }
    })
  })

  
  describe('fft_helpers', function () {
    
    it('can get available windows', function () {
      var w = fftCalc.windows()
      w.length.should.not.equal(0)
      w[2].should.be.a.String
    })

    
    it('detects wrong radix', function () {
      // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      var fftCalcWrong = new Fft(1234)
      fftCalcWrong.should.be.empty
    })
  })
})
