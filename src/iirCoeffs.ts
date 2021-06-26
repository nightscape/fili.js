'use strict';

interface Coeffs {
    a0: number
    a: number[]
    b: number[]
    k: number
    alpha: number
    cw: number
    A: number,
    wp: number,
    wp2: number,
    z: number[]
}
export default class IirCoeffs {
    [key: string]: (params: IirParams) => Coeffs;
    static preCalc(params: IirParams, coeffs: any) {
        let Q = params.Q;
        let Fc = params.Fc;
        let Fs = params.Fs;
        let pre = {} as Coeffs;
        let w = 2 * Math.PI * Fc / Fs;
        if (params.BW) {
            
            pre.alpha = Math.sin(w) * Math.sinh(Math.log(2) / 2 * params.BW * w / Math.sin(w));
        }
        else {
            pre.alpha = Math.sin(w) / (2 * Q);
        }
        pre.cw = Math.cos(w);
        pre.a0 = 1 + pre.alpha;
        coeffs.a0 = pre.a0;
        coeffs.a.push((-2 * pre.cw) / pre.a0);
        coeffs.k = 1;
        coeffs.a.push((1 - pre.alpha) / pre.a0);
        return pre;
    };
    static preCalcGain(params: IirParams) {
        let Q = params.Q;
        let Fc = params.Fc;
        let Fs = params.Fs;
        let pre = {} as Coeffs;
        let w = 2 * Math.PI * Fc / Fs;
        pre.alpha = Math.sin(w) / (2 * Q);
        pre.cw = Math.cos(w);
        pre.A = Math.pow(10, params.gain / 40);
        return pre;
    };
    static initCoeffs(): Coeffs {
        let coeffs = {} as Coeffs;
        coeffs.z = [0, 0];
        coeffs.a = [];
        coeffs.b = [];
        return coeffs;
    };
    fromPZ(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        coeffs.a0 = 1;
        coeffs.b.push(1);
        coeffs.b.push(-params.z0.re - params.z1.re);
        coeffs.b.push(params.z0.re * params.z1.re - params.z0.im * params.z1.im);
        coeffs.a.push(-params.p0.re - params.p1.re);
        coeffs.a.push(params.p0.re * params.p1.re - params.p0.im * params.p1.im);
        if (params.type === 'lowpass') {
            coeffs.k = (1 + coeffs.a[0] + coeffs.a[1]) / (1 + coeffs.b[1] + coeffs.b[2]);
        }
        else {
            coeffs.k = (1 - coeffs.a[0] + coeffs.a[1]) / (1 - coeffs.b[1] + coeffs.b[2]);
        }
        return coeffs;
    }
    // lowpass matched-z transform: H(s) = 1/(1+a's/w_c+b's^2/w_c)
    lowpassMZ(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        coeffs.a0 = 1;
        let as = params.as;
        let bs = params.bs;
        let w = 2 * Math.PI * params.Fc / params.Fs;
        let s = -(as / (2 * bs));
        coeffs.a.push(-Math.pow(Math.E, s * w) * 2 * Math.cos(-w * Math.sqrt(Math.abs(Math.pow(as, 2) / (4 * Math.pow(bs, 2)) - 1 / bs))));
        coeffs.a.push(Math.pow(Math.E, 2 * s * w));
        // correct gain
        if (!params.preGain) {
            coeffs.b.push(coeffs.a0 + coeffs.a[0] + coeffs.a[1]);
            coeffs.k = 1;
        }
        else {
            coeffs.b.push(1);
            coeffs.k = coeffs.a0 + coeffs.a[0] + coeffs.a[1];
        }
        coeffs.b.push(0);
        coeffs.b.push(0);
        return coeffs;
    }
    // Bessel-Thomson: H(s) = 3/(s^2+3*s+3)
    lowpassBT(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        params.Q = 1;
        coeffs.wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        coeffs.wp2 = coeffs.wp * coeffs.wp;
        if (params.BW) {
            delete params.BW;
        }
        coeffs.k = 1;
        coeffs.a0 = 3 * coeffs.wp + 3 * coeffs.wp2 + 1;
        coeffs.b.push(3 * coeffs.wp2 * params.Q / coeffs.a0);
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        coeffs.a.push((6 * coeffs.wp2 - 2) / coeffs.a0);
        coeffs.a.push((3 * coeffs.wp2 - 3 * coeffs.wp + 1) / coeffs.a0);
        return coeffs;
    }
    highpassBT(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        params.Q = 1;
        coeffs.wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        coeffs.wp2 = coeffs.wp * coeffs.wp;
        if (params.BW) {
            delete params.BW;
        }
        coeffs.k = 1;
        coeffs.a0 = coeffs.wp + coeffs.wp2 + 3;
        coeffs.b.push(3 * params.Q / coeffs.a0);
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        coeffs.a.push((2 * coeffs.wp2 - 6) / coeffs.a0);
        coeffs.a.push((coeffs.wp2 - coeffs.wp + 3) / coeffs.a0);
        return coeffs;
    }
    /*
     * Formulas from http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
     */
    // H(s) = 1 / (s^2 + s/Q + 1)
    lowpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalc(params, coeffs);
        if (params.preGain) {
            coeffs.k = (1 - (p as any).cw) * 0.5;
            coeffs.b.push(1 / ((p as any).a0));
        }
        else {
            coeffs.k = 1;
            coeffs.b.push((1 - (p as any).cw) / (2 * (p as any).a0));
        }
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
    }
    // H(s) = s^2 / (s^2 + s/Q + 1)
    highpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalc(params, coeffs);
        if (params.preGain) {
            coeffs.k = (1 + (p as any).cw) * 0.5;
            coeffs.b.push(1 / ((p as any).a0));
        }
        else {
            coeffs.k = 1;
            coeffs.b.push((1 + (p as any).cw) / (2 * (p as any).a0));
        }
        coeffs.b.push(-2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
    }
    // H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1)
    allpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push((1 - (p as any).alpha) / (p as any).a0);
        coeffs.b.push(-2 * (p as any).cw / (p as any).a0);
        coeffs.b.push((1 + (p as any).alpha) / (p as any).a0);
        return coeffs;
    }
    // H(s) = s / (s^2 + s/Q + 1)
    bandpassQ(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push((p as any).alpha * params.Q / (p as any).a0);
        coeffs.b.push(0);
        coeffs.b.push(-coeffs.b[0]);
        return coeffs;
    }
    // H(s) = (s/Q) / (s^2 + s/Q + 1)
    bandpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push((p as any).alpha / (p as any).a0);
        coeffs.b.push(0);
        coeffs.b.push(-coeffs.b[0]);
        return coeffs;
    }
    // H(s) = (s^2 + 1) / (s^2 + s/Q + 1)
    bandstop(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(1 / (p as any).a0);
        coeffs.b.push(-2 * (p as any).cw / (p as any).a0);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
    }
    // H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1)
    peak(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalcGain(params);
        coeffs.k = 1;
        coeffs.a0 = 1 + (p as any).alpha / (p as any).A;
        coeffs.a.push(-2 * (p as any).cw / coeffs.a0);
        coeffs.a.push((1 - (p as any).alpha / (p as any).A) / coeffs.a0);
        coeffs.b.push((1 + (p as any).alpha * (p as any).A) / coeffs.a0);
        coeffs.b.push(-2 * (p as any).cw / coeffs.a0);
        coeffs.b.push((1 - (p as any).alpha * (p as any).A) / coeffs.a0);
        return coeffs;
    }
    // H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1)
    lowshelf(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalcGain(params);
        coeffs.k = 1;
        let sa = 2 * Math.sqrt((p as any).A) * (p as any).alpha;
        coeffs.a0 = ((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw + sa;
        coeffs.a.push((-2 * (((p as any).A - 1) + ((p as any).A + 1) * (p as any).cw)) / coeffs.a0);
        coeffs.a.push((((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw - sa) / coeffs.a0);
        coeffs.b.push(((p as any).A * (((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw + sa)) / coeffs.a0);
        coeffs.b.push((2 * (p as any).A * (((p as any).A - 1) - ((p as any).A + 1) * (p as any).cw)) / coeffs.a0);
        coeffs.b.push(((p as any).A * (((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw - sa)) / coeffs.a0);
        return coeffs;
    }
    // H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A)
    highshelf(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalcGain(params);
        coeffs.k = 1;
        let sa = 2 * Math.sqrt((p as any).A) * (p as any).alpha;
        coeffs.a0 = ((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw + sa;
        coeffs.a.push((2 * (((p as any).A - 1) - ((p as any).A + 1) * (p as any).cw)) / coeffs.a0);
        coeffs.a.push((((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw - sa) / coeffs.a0);
        coeffs.b.push(((p as any).A * (((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw + sa)) / coeffs.a0);
        coeffs.b.push((-2 * (p as any).A * (((p as any).A - 1) + ((p as any).A + 1) * (p as any).cw)) / coeffs.a0);
        coeffs.b.push(((p as any).A * (((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw - sa)) / coeffs.a0);
        return coeffs;
    }
    // taken from: Design of digital filters for frequency weightings (A and C) required for risk assessments of workers exposed to noise
    // use Butterworth one stage IIR filter to get the results from the paper
    aweighting(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        coeffs.k = 1;
        let wo = 2 * Math.PI * params.Fc / params.Fs;
        let w = 2 * Math.tan(wo / 2);
        let Q = params.Q;
        let wsq = Math.pow(w, 2);
        coeffs.a0 = 4 * Q + wsq * Q + 2 * w;
        coeffs.a.push(2 * wsq * Q - 8 * Q);
        coeffs.a.push((4 * Q + wsq * Q - 2 * w));
        coeffs.b.push(wsq * Q);
        coeffs.b.push(2 * wsq * Q);
        coeffs.b.push(wsq * Q);
        return coeffs;
    }
};

module.exports = IirCoeffs;
export interface IirParams {
  order: number
  Fa: number
  Fb: number
  Fc: number
  Fs: number
  Q: number
  BW: number
  gain: number
  preGain: number
  Att: number
}
