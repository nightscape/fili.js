'use strict'

import Complex from "./complex"

import {
  runMultiFilter,
  runMultiFilterReverse,
  complex,
  evaluatePhase

} from './utils'

/**
 * Fir filter
 */
export default class FirFilter {
  f: any
  b: any[] = []
  z: any
  constructor(filter: any) {
    this.f = filter
    let cnt = 0
    // note: coefficients are equal to input response
    for (let cnt = 0; cnt < this.f.length; cnt++) {
      this.b[cnt] = {
        re: this.f[cnt],
        im: 0
      } as Complex
    }
    this.z = FirFilter.initZero(this.f.length - 1)
  }

  static initZero(cnt: any) {
    let r = []
    let i
    for (i = 0; i < cnt; i++) {
      r.push(0)
    }
    return {
      buf: r,
      pointer: 0
    }
  }

  doStep(input: any, d: any) {
    d.buf[d.pointer] = input
    let out = 0
    let cnt = 0
    for (let cnt = 0; cnt < d.buf.length; cnt++) {
      out += (this.f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length])
    }
    d.pointer = (d.pointer + 1) % (d.buf.length)
    return out
  }

  calcInputResponse(input: any) {
    let tempF = FirFilter.initZero(this.f.length - 1)
    return runMultiFilter(input, tempF, (input: any, coeffs: any) => this.doStep(input, coeffs))
  }

  calcResponse(params: any) {
    let Fs = params.Fs
    let Fr = params.Fr
    // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
    // z^-1 = exp(-j*omega*pi)
    // omega is between 0 and 1. 1 is the Nyquist frequency.
    let theta = -Math.PI * (Fr / Fs) * 2
    let h = {
      re: 0,
      im: 0
    }
    for (let i = 0; i < this.f.length - 1; i++) {
      h = complex.add(h, complex.mul(this.b[i], {
        re: Math.cos(theta * i),
        im: Math.sin(theta * i)
      }))
    }
    let m = complex.magnitude(h)
    let res = {
      magnitude: m,
      phase: complex.phase(h),
      dBmagnitude: 20 * Math.log(m) * Math.LOG10E
    }
    return res
  }

  responsePoint(params: any) {
    return this.calcResponse(params)
  }
  response(resolution: any) {
    resolution = resolution || 100
    let res = []
    let cnt = 0
    let r = resolution * 2
    for (let cnt = 0; cnt < resolution; cnt++) {
      res[cnt] = this.calcResponse({
        Fs: r,
        Fr: cnt
      })
    }
    evaluatePhase(res)
    return res
  }
  simulate(input: any) {
    return this.calcInputResponse(input)
  }
  singleStep(input: any) {
    return this.doStep(input, this.z)
  }
  multiStep(input: any, overwrite: any) {
    return runMultiFilter(input, this.z, (input: any, coeffs: any) => this.doStep(input, coeffs), overwrite)
  }
  filtfilt(input: any, overwrite: any) {
    return runMultiFilterReverse(runMultiFilter(
      input, this.z, (input: any, coeffs: any) => this.doStep(input, coeffs), overwrite), this.z, (input: any, coeffs: any) => this.doStep(input, coeffs), true)
  }
  reinit() {
    this.z = FirFilter.initZero(this.f.length - 1)
  }

}
