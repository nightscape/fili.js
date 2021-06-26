'use strict'

/**
 * Evaluate phase
 */

export function evaluatePhase (res: any) {
  let xcnt = 0
  let cnt = 0
  let pi = Math.PI
  let tpi = 2 * pi
  let phase = []
  for (let cnt = 0; cnt < res.length; cnt++) {
    phase.push(res[cnt].phase)
  }
  res[0].unwrappedPhase = res[0].phase
  res[0].groupDelay = 0
  // TODO: more sophisticated phase unwrapping needed
  for (let cnt = 1; cnt < phase.length; cnt++) {
    let diff = phase[cnt] - phase[cnt - 1]
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

export function runMultiFilter (input: any, d: any, doStep: any, overwrite: boolean = false) {
  let out = []
  if (overwrite) {
    out = input
  }
  for (let i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d)
  }
  return out
}


export function runMultiFilterReverse (input: any, d: any, doStep: any, overwrite: any) {
  let out = []
  if (overwrite) {
    out = input
  }
  let i
  for (i = input.length - 1; i >= 0; i--) {
    out[i] = doStep(input[i], d)
  }
  return out
}

// @ts-expect-error ts-migrate(7023) FIXME: 'factorial' implicitly has return type 'any' becau... Remove this comment to see the full error message
let factorial = function (n: any, a: any? = null) {
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

export function besselFactors (n: any) {
  let res = []
  for (let k = 0; k < n + 1; k++) {
    
    let p = factorial(2 * n - k)
    
    let q = Math.pow(2, (n - k)) * factorial(k) * factorial(n - k)
    res.unshift(Math.floor(p / q))
  }
  return res
}

let fractionToFp = function (fraction: any, fractionBits: any) {
  let fpFraction = 0
  for (let cnt = 0; cnt < fractionBits; cnt++) {
    let bitVal = 1 / Math.pow(2, cnt + 1)
    if (fraction > bitVal) {
      fraction -= bitVal
      fpFraction += bitVal
    }
  }
  return fpFraction
}

let numberToFp = function (number: any, numberBits: any) {
  return number & Math.pow(2, numberBits)
}

let valueToFp = function (value: any, numberBits: any, fractionBits: any) {
  let number = Math.abs(value)
  let fraction = value - number
  let fpNumber = {
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

export let complex = {

  div: function (p: any, q: any) {
    let a = p.re
    let b = p.im
    let c = q.re
    let d = q.im
    let n = (c * c + d * d)
    let x = {
      re: (a * c + b * d) / n,
      im: (b * c - a * d) / n
    }
    return x
  },
  mul: function (p: any, q: any) {
    let a = p.re
    let b = p.im
    let c = q.re
    let d = q.im
    let x = {
      re: (a * c - b * d),
      im: (a + b) * (c + d) - a * c - b * d
    }
    return x
  },
  add: function (p: any, q: any) {
    let x = {
      re: p.re + q.re,
      im: p.im + q.im
    }
    return x
  },
  sub: function (p: any, q: any) {
    let x = {
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
