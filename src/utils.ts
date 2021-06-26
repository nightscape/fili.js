'use strict'

/**
 * Evaluate phase
 */

exports.evaluatePhase = function (res: any) {
  var xcnt = 0
  var cnt = 0
  var pi = Math.PI
  var tpi = 2 * pi
  var phase = []
  for (cnt = 0; cnt < res.length; cnt++) {
    phase.push(res[cnt].phase)
  }
  res[0].unwrappedPhase = res[0].phase
  res[0].groupDelay = 0
  // TODO: more sophisticated phase unwrapping needed
  for (cnt = 1; cnt < phase.length; cnt++) {
    var diff = phase[cnt] - phase[cnt - 1]
    if (diff > pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] -= tpi
      }
    } else if (diff < -pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] += tpi
      }
    }
    if (phase[cnt] < 0) {
      res[cnt].unwrappedPhase = -phase[cnt]
    } else {
      res[cnt].unwrappedPhase = phase[cnt]
    }

    res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length)
    res[cnt].groupDelay = (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) / (pi / res.length)
    if (res[cnt].groupDelay < 0) {
      res[cnt].groupDelay = -res[cnt].groupDelay
    }
  }
  if (res[0].magnitude !== 0) {
    res[0].phaseDelay = res[1].phaseDelay
    res[0].groupDelay = res[1].groupDelay
  } else {
    res[0].phaseDelay = res[2].phaseDelay
    res[0].groupDelay = res[2].groupDelay
    res[1].phaseDelay = res[2].phaseDelay
    res[1].groupDelay = res[2].groupDelay
  }
}

/**
 * Run multi filter
 */

exports.runMultiFilter = function (input: any, d: any, doStep: any, overwrite: any) {
  var out = []
  if (overwrite) {
    out = input
  }
  for (var i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d)
  }
  return out
}


exports.runMultiFilterReverse = function (input: any, d: any, doStep: any, overwrite: any) {
  var out = []
  if (overwrite) {
    out = input
  }
  var i
  for (i = input.length - 1; i >= 0; i--) {
    out[i] = doStep(input[i], d)
  }
  return out
}

// @ts-expect-error ts-migrate(7023) FIXME: 'factorial' implicitly has return type 'any' becau... Remove this comment to see the full error message
var factorial = function (n: any, a: any? = null) {
  if (!a) {
    a = 1
  }
  if (n !== Math.floor(n) || a !== Math.floor(a)) {
    return 1
  }
  if (n === 0 || n === 1) {
    return a
  } else {
    return factorial(n - 1, a * n)
  }
}

/**
 * Bessel factors
 */

exports.besselFactors = function (n: any) {
  var res = []
  for (var k = 0; k < n + 1; k++) {
    
    var p = factorial(2 * n - k)
    
    var q = Math.pow(2, (n - k)) * factorial(k) * factorial(n - k)
    res.unshift(Math.floor(p / q))
  }
  return res
}

var fractionToFp = function (fraction: any, fractionBits: any) {
  var fpFraction = 0
  for (var cnt = 0; cnt < fractionBits; cnt++) {
    var bitVal = 1 / Math.pow(2, cnt + 1)
    if (fraction > bitVal) {
      fraction -= bitVal
      fpFraction += bitVal
    }
  }
  return fpFraction
}

var numberToFp = function (number: any, numberBits: any) {
  return number & Math.pow(2, numberBits)
}

var valueToFp = function (value: any, numberBits: any, fractionBits: any) {
  var number = Math.abs(value)
  var fraction = value - number
  var fpNumber = {
    number: numberToFp(number, numberBits).toString(),
    fraction: fractionToFp(fraction, fractionBits).toString(),
    numberBits: numberBits,
    fractionBits: fractionBits
  }
  return fpNumber
}


exports.fixedPoint = {
  convert: function (value: any, numberBits: any, fractionBits: any) {
    return valueToFp(value, numberBits, fractionBits)
  },
  add: function (fpVal1: any, fpVal2: any) {
  },
  sub: function (fpVal1: any, fpVal2: any) {
  },
  mul: function (fpVal1: any, fpVal2: any) {
  },
  div: function (fpVal1: any, fpVal2: any) {
  }
}

/**
 * Complex
 */

exports.complex = {

  div: function (p: any, q: any) {
    var a = p.re
    var b = p.im
    var c = q.re
    var d = q.im
    var n = (c * c + d * d)
    var x = {
      re: (a * c + b * d) / n,
      im: (b * c - a * d) / n
    }
    return x
  },
  mul: function (p: any, q: any) {
    var a = p.re
    var b = p.im
    var c = q.re
    var d = q.im
    var x = {
      re: (a * c - b * d),
      im: (a + b) * (c + d) - a * c - b * d
    }
    return x
  },
  add: function (p: any, q: any) {
    var x = {
      re: p.re + q.re,
      im: p.im + q.im
    }
    return x
  },
  sub: function (p: any, q: any) {
    var x = {
      re: p.re - q.re,
      im: p.im - q.im
    }
    return x
  },
  phase: function (n: any) {
    return Math.atan2(n.im, n.re)
  },
  magnitude: function (n: any) {
    return Math.sqrt(n.re * n.re + n.im * n.im)
  }
}
