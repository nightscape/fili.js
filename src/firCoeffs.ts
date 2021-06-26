'use strict'

export default class FirCoeffs {
  // Kaiser windowd filters
  // desired attenuation can be defined
  // better than windowd sinc filters
  static calcKImpulseResponse(params: FirParams) {
    var Fs = params.Fs
    var Fa = params.Fa
    var Fb = params.Fb
    var o = params.order || 51
    var alpha = params.Att || 100
    var ino = function (val: any) {
      var d = 0
      var ds = 1
      var s = 1
      while (ds > s * 1e-6) {
        d += 2
        ds *= val * val / (d * d)
        s += ds
      }
      return s
    }

    if (o / 2 - Math.floor(o / 2) === 0) {
      o++
    }
    var Np = (o - 1) / 2
    var A = []
    var beta = 0
    var cnt = 0
    var inoBeta
    var ret = []

    A[0] = 2 * (Fb - Fa) / Fs
    for (cnt = 1; cnt <= Np; cnt++) {
      A[cnt] = (Math.sin(2 * cnt * Math.PI * Fb / Fs) - Math.sin(2 * cnt * Math.PI * Fa / Fs)) / (cnt * Math.PI)
    }
    // empirical coefficients
    if (alpha < 21) {
      beta = 0
    } else if (alpha > 50) {
      beta = 0.1102 * (alpha - 8.7)
    } else {
      beta = 0.5842 * Math.pow((alpha - 21), 0.4) + 0.07886 * (alpha - 21)
    }

    inoBeta = ino(beta)
    for (cnt = 0; cnt <= Np; cnt++) {
      ret[Np + cnt] = A[cnt] * ino(beta * Math.sqrt(1 - (cnt * cnt / (Np * Np)))) / inoBeta
    }
    for (cnt = 0; cnt < Np; cnt++) {
      ret[cnt] = ret[o - 1 - cnt]
    }
    return ret
  }

  // note: coefficients are equal to impulse response
  // windowd sinc filter
  static calcImpulseResponse(params: FirParams) {
    var Fs = params.Fs
    var Fc = params.Fc
    var o = params.order
    var omega = 2 * Math.PI * Fc / Fs
    var cnt = 0
    var dc = 0
    var ret = []
    // sinc function is considered to be
    // the ideal impulse response
    // do an idft and use Hamming window afterwards
    for (cnt = 0; cnt <= o; cnt++) {
      if (cnt - o / 2 === 0) {
        ret[cnt] = omega
      } else {
        ret[cnt] = Math.sin(omega * (cnt - o / 2)) / (cnt - o / 2)
        // Hamming window
        ret[cnt] *= (0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o))
      }
      dc = dc + ret[cnt]
    }
    // normalize
    for (cnt = 0; cnt <= o; cnt++) {
      ret[cnt] /= dc
    }
    return ret
  }
  // invert for highpass from lowpass
  static invert(h: any) {
    var cnt
    for (cnt = 0; cnt < h.length; cnt++) {
      h[cnt] = -h[cnt]
    }
    h[(h.length - 1) / 2]++
    return h
  }
  static bs(params: any) {
    var lp = FirCoeffs.calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F2
    } as FirParams)
    var hp = FirCoeffs.invert(FirCoeffs.calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F1
    } as FirParams))
    var out = []
    for (var i = 0; i < lp.length; i++) {
      out.push(lp[i] + hp[i])
    }
    return out
  }

  lowpass(params: any) {
    return FirCoeffs.calcImpulseResponse(params)
  }
  highpass(params: any) {
    return FirCoeffs.invert(FirCoeffs.calcImpulseResponse(params))
  }
  bandstop(params: any) {
    return FirCoeffs.bs(params)
  }
  bandpass(params: any) {
    return FirCoeffs.invert(FirCoeffs.bs(params))
  }
  kbFilter(params: any) {
    return FirCoeffs.calcKImpulseResponse(params)
  }
  available() {
    return ['lowpass', 'highpass', 'bandstop', 'bandpass', 'kbFilter']
  }
}

export interface FirParams {
  order: number
  Fa: number
  Fb: number
  Fc: number
  Fs: number
  Att: number
}
