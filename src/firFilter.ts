'use strict'

var {
  runMultiFilter,
  runMultiFilterReverse,
  complex,
  evaluatePhase
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require('./utils')

/**
 * Fir filter
 */
var FirFilter = function (filter: any) {
  // note: coefficients are equal to input response
  var f = filter
  var b: any = []
  var cnt = 0
  for (cnt = 0; cnt < f.length; cnt++) {
    b[cnt] = {
      re: f[cnt],
      im: 0
    }
  }

  var initZero = function (cnt: any) {
    var r = []
    var i
    for (i = 0; i < cnt; i++) {
      r.push(0)
    }
    return {
      buf: r,
      pointer: 0
    }
  }

  var z = initZero(f.length - 1)

  var doStep = function (input: any, d: any) {
    d.buf[d.pointer] = input
    var out = 0
    for (cnt = 0; cnt < d.buf.length; cnt++) {
      out += (f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length])
    }
    d.pointer = (d.pointer + 1) % (d.buf.length)
    return out
  }

  var calcInputResponse = function (input: any) {
    var tempF = initZero(f.length - 1)
    return runMultiFilter(input, tempF, doStep)
  }

  var calcResponse = function (params: any) {
    var Fs = params.Fs
    var Fr = params.Fr
    // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
    // z^-1 = exp(-j*omega*pi)
    // omega is between 0 and 1. 1 is the Nyquist frequency.
    var theta = -Math.PI * (Fr / Fs) * 2
    var h = {
      re: 0,
      im: 0
    }
    for (var i = 0; i < f.length - 1; i++) {
      h = complex.add(h, complex.mul(b[i], {
        re: Math.cos(theta * i),
        im: Math.sin(theta * i)
      }))
    }
    var m = complex.magnitude(h)
    var res = {
      magnitude: m,
      phase: complex.phase(h),
      dBmagnitude: 20 * Math.log(m) * Math.LOG10E
    }
    return res
  }

  var self = {
    responsePoint: function (params: any) {
      return calcResponse(params)
    },
    response: function (resolution: any) {
      resolution = resolution || 100
      var res = []
      var cnt = 0
      var r = resolution * 2
      for (cnt = 0; cnt < resolution; cnt++) {
        res[cnt] = calcResponse({
          Fs: r,
          Fr: cnt
        })
      }
      evaluatePhase(res)
      return res
    },
    simulate: function (input: any) {
      return calcInputResponse(input)
    },
    singleStep: function (input: any) {
      return doStep(input, z)
    },
    multiStep: function (input: any, overwrite: any) {
      return runMultiFilter(input, z, doStep, overwrite)
    },
    filtfilt: function (input: any, overwrite: any) {
      return runMultiFilterReverse(runMultiFilter(
        input, z, doStep, overwrite), z, doStep, true)
    },
    reinit: function () {
      z = initZero(f.length - 1)
    }
  }
  return self
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = FirFilter
