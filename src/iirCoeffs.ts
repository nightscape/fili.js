'use strict';

interface Coeffs {
    a0: number
    a: number[]
    b: number[]
    k: number
    alpha: number
    cw: number
    A: number,
    z: number[]
}
export default class IirCoeffs {
    [key: string]: (params: any) => Coeffs;
    static preCalc(params: any, coeffs: any) {
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
    static preCalcGain(params: any) {
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
        (coeffs as any).a0 = 1;
        (coeffs as any).b.push(1);
        (coeffs as any).b.push(-params.z0.re - params.z1.re);
        (coeffs as any).b.push(params.z0.re * params.z1.re - params.z0.im * params.z1.im);
        (coeffs as any).a.push(-params.p0.re - params.p1.re);
        (coeffs as any).a.push(params.p0.re * params.p1.re - params.p0.im * params.p1.im);
        if (params.type === 'lowpass') {
            (coeffs as any).k = (1 + (coeffs as any).a[0] + (coeffs as any).a[1]) / (1 + (coeffs as any).b[1] + (coeffs as any).b[2]);
        }
        else {
            (coeffs as any).k = (1 - (coeffs as any).a[0] + (coeffs as any).a[1]) / (1 - (coeffs as any).b[1] + (coeffs as any).b[2]);
        }
        return coeffs;
    }
    // lowpass matched-z transform: H(s) = 1/(1+a's/w_c+b's^2/w_c)
    lowpassMZ(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        (coeffs as any).a0 = 1;
        let as = params.as;
        let bs = params.bs;
        let w = 2 * Math.PI * params.Fc / params.Fs;
        let s = -(as / (2 * bs));
        (coeffs as any).a.push(-Math.pow(Math.E, s * w) * 2 * Math.cos(-w * Math.sqrt(Math.abs(Math.pow(as, 2) / (4 * Math.pow(bs, 2)) - 1 / bs))));
        (coeffs as any).a.push(Math.pow(Math.E, 2 * s * w));
        // correct gain
        if (!params.preGain) {
            (coeffs as any).b.push((coeffs as any).a0 + (coeffs as any).a[0] + (coeffs as any).a[1]);
            (coeffs as any).k = 1;
        }
        else {
            (coeffs as any).b.push(1);
            (coeffs as any).k = (coeffs as any).a0 + (coeffs as any).a[0] + (coeffs as any).a[1];
        }
        (coeffs as any).b.push(0);
        (coeffs as any).b.push(0);
        return coeffs;
    }
    // Bessel-Thomson: H(s) = 3/(s^2+3*s+3)
    lowpassBT(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        params.Q = 1;
        (coeffs as any).wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        (coeffs as any).wp2 = (coeffs as any).wp * (coeffs as any).wp;
        if (params.BW) {
            delete params.BW;
        }
        (coeffs as any).k = 1;
        (coeffs as any).a0 = 3 * (coeffs as any).wp + 3 * (coeffs as any).wp2 + 1;
        (coeffs as any).b.push(3 * (coeffs as any).wp2 * params.Q / (coeffs as any).a0);
        (coeffs as any).b.push(2 * (coeffs as any).b[0]);
        (coeffs as any).b.push((coeffs as any).b[0]);
        (coeffs as any).a.push((6 * (coeffs as any).wp2 - 2) / (coeffs as any).a0);
        (coeffs as any).a.push((3 * (coeffs as any).wp2 - 3 * (coeffs as any).wp + 1) / (coeffs as any).a0);
        return coeffs;
    }
    highpassBT(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        params.Q = 1;
        (coeffs as any).wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        (coeffs as any).wp2 = (coeffs as any).wp * (coeffs as any).wp;
        if (params.BW) {
            delete params.BW;
        }
        (coeffs as any).k = 1;
        (coeffs as any).a0 = (coeffs as any).wp + (coeffs as any).wp2 + 3;
        (coeffs as any).b.push(3 * params.Q / (coeffs as any).a0);
        (coeffs as any).b.push(2 * (coeffs as any).b[0]);
        (coeffs as any).b.push((coeffs as any).b[0]);
        (coeffs as any).a.push((2 * (coeffs as any).wp2 - 6) / (coeffs as any).a0);
        (coeffs as any).a.push(((coeffs as any).wp2 - (coeffs as any).wp + 3) / (coeffs as any).a0);
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
            (coeffs as any).k = (1 - (p as any).cw) * 0.5;
            (coeffs as any).b.push(1 / ((p as any).a0));
        }
        else {
            (coeffs as any).k = 1;
            (coeffs as any).b.push((1 - (p as any).cw) / (2 * (p as any).a0));
        }
        (coeffs as any).b.push(2 * (coeffs as any).b[0]);
        (coeffs as any).b.push((coeffs as any).b[0]);
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
            (coeffs as any).k = (1 + (p as any).cw) * 0.5;
            (coeffs as any).b.push(1 / ((p as any).a0));
        }
        else {
            (coeffs as any).k = 1;
            (coeffs as any).b.push((1 + (p as any).cw) / (2 * (p as any).a0));
        }
        (coeffs as any).b.push(-2 * (coeffs as any).b[0]);
        (coeffs as any).b.push((coeffs as any).b[0]);
        return coeffs;
    }
    // H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1)
    allpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalc(params, coeffs);
        (coeffs as any).k = 1;
        (coeffs as any).b.push((1 - (p as any).alpha) / (p as any).a0);
        (coeffs as any).b.push(-2 * (p as any).cw / (p as any).a0);
        (coeffs as any).b.push((1 + (p as any).alpha) / (p as any).a0);
        return coeffs;
    }
    // H(s) = s / (s^2 + s/Q + 1)
    bandpassQ(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        (coeffs as any).k = 1;
        (coeffs as any).b.push((p as any).alpha * params.Q / (p as any).a0);
        (coeffs as any).b.push(0);
        (coeffs as any).b.push(-(coeffs as any).b[0]);
        return coeffs;
    }
    // H(s) = (s/Q) / (s^2 + s/Q + 1)
    bandpass(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        (coeffs as any).k = 1;
        (coeffs as any).b.push((p as any).alpha / (p as any).a0);
        (coeffs as any).b.push(0);
        (coeffs as any).b.push(-(coeffs as any).b[0]);
        return coeffs;
    }
    // H(s) = (s^2 + 1) / (s^2 + s/Q + 1)
    bandstop(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalc(params, coeffs);
        (coeffs as any).k = 1;
        (coeffs as any).b.push(1 / (p as any).a0);
        (coeffs as any).b.push(-2 * (p as any).cw / (p as any).a0);
        (coeffs as any).b.push((coeffs as any).b[0]);
        return coeffs;
    }
    // H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1)
    peak(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        let p = IirCoeffs.preCalcGain(params);
        (coeffs as any).k = 1;
        (coeffs as any).a0 = 1 + (p as any).alpha / (p as any).A;
        (coeffs as any).a.push(-2 * (p as any).cw / (coeffs as any).a0);
        (coeffs as any).a.push((1 - (p as any).alpha / (p as any).A) / (coeffs as any).a0);
        (coeffs as any).b.push((1 + (p as any).alpha * (p as any).A) / (coeffs as any).a0);
        (coeffs as any).b.push(-2 * (p as any).cw / (coeffs as any).a0);
        (coeffs as any).b.push((1 - (p as any).alpha * (p as any).A) / (coeffs as any).a0);
        return coeffs;
    }
    // H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1)
    lowshelf(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalcGain(params);
        (coeffs as any).k = 1;
        let sa = 2 * Math.sqrt((p as any).A) * (p as any).alpha;
        (coeffs as any).a0 = ((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw + sa;
        (coeffs as any).a.push((-2 * (((p as any).A - 1) + ((p as any).A + 1) * (p as any).cw)) / (coeffs as any).a0);
        (coeffs as any).a.push((((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw - sa) / (coeffs as any).a0);
        (coeffs as any).b.push(((p as any).A * (((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw + sa)) / (coeffs as any).a0);
        (coeffs as any).b.push((2 * (p as any).A * (((p as any).A - 1) - ((p as any).A + 1) * (p as any).cw)) / (coeffs as any).a0);
        (coeffs as any).b.push(((p as any).A * (((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw - sa)) / (coeffs as any).a0);
        return coeffs;
    }
    // H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A)
    highshelf(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        if (params.BW) {
            delete params.BW;
        }
        let p = IirCoeffs.preCalcGain(params);
        (coeffs as any).k = 1;
        let sa = 2 * Math.sqrt((p as any).A) * (p as any).alpha;
        (coeffs as any).a0 = ((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw + sa;
        (coeffs as any).a.push((2 * (((p as any).A - 1) - ((p as any).A + 1) * (p as any).cw)) / (coeffs as any).a0);
        (coeffs as any).a.push((((p as any).A + 1) - ((p as any).A - 1) * (p as any).cw - sa) / (coeffs as any).a0);
        (coeffs as any).b.push(((p as any).A * (((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw + sa)) / (coeffs as any).a0);
        (coeffs as any).b.push((-2 * (p as any).A * (((p as any).A - 1) + ((p as any).A + 1) * (p as any).cw)) / (coeffs as any).a0);
        (coeffs as any).b.push(((p as any).A * (((p as any).A + 1) + ((p as any).A - 1) * (p as any).cw - sa)) / (coeffs as any).a0);
        return coeffs;
    }
    // taken from: Design of digital filters for frequency weightings (A and C) required for risk assessments of workers exposed to noise
    // use Butterworth one stage IIR filter to get the results from the paper
    aweighting(params: any) {
        let coeffs = IirCoeffs.initCoeffs();
        (coeffs as any).k = 1;
        let wo = 2 * Math.PI * params.Fc / params.Fs;
        let w = 2 * Math.tan(wo / 2);
        let Q = params.Q;
        let wsq = Math.pow(w, 2);
        (coeffs as any).a0 = 4 * Q + wsq * Q + 2 * w;
        (coeffs as any).a.push(2 * wsq * Q - 8 * Q);
        (coeffs as any).a.push((4 * Q + wsq * Q - 2 * w));
        (coeffs as any).b.push(wsq * Q);
        (coeffs as any).b.push(2 * wsq * Q);
        (coeffs as any).b.push(wsq * Q);
        return coeffs;
    }
};

module.exports = IirCoeffs;
