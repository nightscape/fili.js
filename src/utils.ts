import Complex from './complex';
"use strict";

/**
 * Evaluate phase
 */

export function evaluatePhase(res: any[]) {
  const pi = Math.PI;
  const tpi = 2 * pi;
  const phase: number[] = [];
  for (let cnt = 0; cnt < res.length; cnt++) {
    phase.push(res[cnt].phase);
  }
  res[0].unwrappedPhase = res[0].phase;
  res[0].groupDelay = 0;
  // TODO: more sophisticated phase unwrapping needed
  for (let cnt = 1; cnt < phase.length; cnt++) {
    const diff = phase[cnt] - phase[cnt - 1];
    if (diff > pi) {
      for (let xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] -= tpi;
      }
    } else if (diff < -pi) {
      for (let xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] += tpi;
      }
    }
    if (phase[cnt] < 0) {
      res[cnt].unwrappedPhase = -phase[cnt];
    } else {
      res[cnt].unwrappedPhase = phase[cnt];
    }

    res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length);
    res[cnt].groupDelay =
      (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) /
      (pi / res.length);
    if (res[cnt].groupDelay < 0) {
      res[cnt].groupDelay = -res[cnt].groupDelay;
    }
  }
  if (res[0].magnitude !== 0) {
    res[0].phaseDelay = res[1].phaseDelay;
    res[0].groupDelay = res[1].groupDelay;
  } else {
    res[0].phaseDelay = res[2].phaseDelay;
    res[0].groupDelay = res[2].groupDelay;
    res[1].phaseDelay = res[2].phaseDelay;
    res[1].groupDelay = res[2].groupDelay;
  }
}

/**
 * Run multi filter
 */

export function runMultiFilter(
  input: number[],
  d: any,
  doStep: (input: number, d: any) => number,
  overwrite: boolean = false
): number[] {
  let out: number[] = [];
  if (overwrite) {
    out = input;
  }
  for (let i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d);
  }
  return out;
}

export function runMultiFilterReverse(
  input: number[],
  d: any,
  doStep: (input: number, d: any) => number,
  overwrite: any
): number[] {
  let out: number[] = [];
  if (overwrite) {
    out = input;
  }
  let i;
  for (i = input.length - 1; i >= 0; i--) {
    out[i] = doStep(input[i], d);
  }
  return out;
}

function factorial(n: number, a: number | null | undefined = null): number {
  if (!a) {
    a = 1;
  }
  if (n !== Math.floor(n) || a !== Math.floor(a)) {
    return 1;
  }
  if (n === 0 || n === 1) {
    return a;
  } else {
    return factorial(n - 1, a * n);
  }
};

/**
 * Bessel factors
 */

export function besselFactors(n: any) {
  const res = [];
  for (let k = 0; k < n + 1; k++) {
    const p = factorial(2 * n - k);

    const q = Math.pow(2, n - k) * factorial(k) * factorial(n - k);
    res.unshift(Math.floor(p / q));
  }
  return res;
}

/**
 * Complex
 */

export const complex = {
  div: function (p: Complex, q: Complex): Complex {
    let a = p.re
    let b = p.im
    let c = q.re
    let d = q.im
    let n = c * c + d * d
    return new Complex(
      (a * c + b * d) / n,
      (b * c - a * d) / n,
    )
  },
  mul: function (p: Complex, q: Complex): Complex {
    const a = p.re;
    const b = p.im;
    const c = q.re;
    const d = q.im;
    return new Complex(
      a * c - b * d,
      (a + b) * (c + d) - a * c - b * d,
    );
  },
  add: function (p: Complex, q: Complex): Complex {
    return new Complex(
      p.re + q.re,
      p.im + q.im,
    );
  },
  sub: function (p: Complex, q: Complex): Complex {
    return new Complex(
      p.re - q.re,
      p.im - q.im,
    );
  },
  phase: function (n: Complex): number {
    return Math.atan2(n.im, n.re);
  },
  magnitude: function (n: Complex): number {
    return Math.sqrt(n.re * n.re + n.im * n.im);
  },
};
