'use strict';
export default class Fft {
    radix: number
    fft: FftData
    windowCalculation: {
        [key: string]: { calc: (...params: any[]) => number, values: number[], correction: number }
        rectangular: { calc: () => number; values: never[]; correction: number; }; none: { calc: () => number; values: never[]; correction: number; }; hanning: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hamming: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; tukery: { calc: (n: any, N: any, a: any) => number; values: never[]; correction: number; }; cosine: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; lanczos: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; triangular: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; bartlett: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; gaussian: { calc: (n: any, N: any, a: any) => number; values: never[]; correction: number; }; bartlettHanning: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; blackman: { calc: (n: any, N: any, a: any) => number; values: never[]; correction: number; }; blackmanHarris: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall3: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall3a: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall3b: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall4: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall4a: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall4b: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nuttall4c: { calc: (n: any, N: any) => number; values: never[]; correction: number; };
        // fast decaying flat top
        sft3f: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; sft4f: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; sft5f: { calc: (n: any, N: any) => number; values: never[]; correction: number; };
        // minimum sidelobe flat top
        sft3m: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; sft4m: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; sft5m: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; nift: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hpft: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; srft: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft70: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft95: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft90d: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft116d: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft144d: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft196d: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft223d: { calc: (n: any, N: any) => number; values: never[]; correction: number; }; hft248d: { calc: (n: any, N: any) => number; values: never[]; correction: number; };
    };
    static isPowerOfTwo(value: any) {
      if (!(value & value - 1)) {
        return true;
      }
      return false;
    };
    constructor(radix: number) {
      this.radix = radix;

      if (!Fft.isPowerOfTwo(radix)) {
        throw new Error('Radix can only be a power of 2');
      }
      this.fft = {} as FftData;
      this.fft.length = radix;
      this.fft.buffer = new Float64Array(radix);
      this.fft.re = new Float64Array(radix);
      this.fft.im = new Float64Array(radix);
      this.fft.reI = new Float64Array(radix);
      this.fft.imI = new Float64Array(radix);
      this.fft.twiddle = new Int32Array(radix);
      this.fft.sinTable = new Float64Array(radix - 1);
      this.fft.cosTable = new Float64Array(radix - 1);
      const TPI = 2 * Math.PI;
      let bits = Math.floor(Math.log(radix) / Math.LN2);
      for (let i = this.fft.sinTable.length; i--;) {
        this.fft.sinTable[i] = Math.sin(TPI * (i / radix));
        this.fft.cosTable[i] = Math.cos(TPI * (i / radix));
      }
      const nh = radix >> 1;
      let i = 0;
      let j = 0;
      for (; ;) {
        this.fft.twiddle[i] = j;
        if (++i >= radix) {
          break;
        }
        bits = nh;
        while (bits <= j) {
          j -= bits;
          bits >>= 1;
        }
        j += bits;
      }
      // good explanation in https://holometer.fnal.gov/GH_FFT.pdf
      const PI = Math.PI;
      const PI2 = Math.PI * 2;
      const abs = Math.abs;
      const pow = Math.pow;
      const cos = Math.cos;
      const sin = Math.sin;
      const sinc = function(x: any) {
        return sin(PI * x) / (PI * x);
      };
      const E = Math.E;
      this.windowCalculation = {
        rectangular: {
          calc: function() {
            return 1;
          },
          values: [],
          correction: 1,
        },
        none: {
          calc: function() {
            return 1;
          },
          values: [],
          correction: 1,
        },
        hanning: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.5 * (1 - cos(z));
          },
          values: [],
          correction: 2,
        },
        hamming: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.54 - 0.46 * cos(z);
          },
          values: [],
          correction: 1.8518999946875638,
        },
        tukery: {
          calc: function(n: any, N: any, a: any) {
            if (n < (a * (N - 1)) / 2) {
              return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - 1)));
            } else if ((N - 1) * (1 - (a / 2)) < n) {
              return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - (2 / a) + 1)));
            } else {
              return 1;
            }
          },
          values: [],
          correction: 4 / 3,
        },
        cosine: {
          calc: function(n: any, N: any) {
            return sin((PI * n) / (N - 1));
          },
          values: [],
          correction: 1.570844266360796,
        },
        lanczos: {
          calc: function(n: any, N: any) {
            return sinc(((2 * n) / (N - 1)) - 1);
          },
          values: [],
          correction: 1.6964337576195783,
        },
        triangular: {
          calc: function(n: any, N: any) {
            return (2 / (N + 1)) * (((N + 1) / 2) - abs(n - ((N - 1) / 2)));
          },
          values: [],
          correction: 2,
        },
        bartlett: {
          calc: function(n: any, N: any) {
            return (2 / (N - 1)) * (((N - 1) / 2) - abs(n - ((N - 1) / 2)));
          },
          values: [],
          correction: 2,
        },
        gaussian: {
          calc: function(n: any, N: any, a: any) {
            return pow(E, -0.5 * pow((n - (N - 1) / 2) / (a * (N - 1) / 2), 2));
          },
          values: [],
          correction: 5 / 3,
        },
        bartlettHanning: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.62 - 0.48 * abs((n / (N - 1)) - 0.5) - 0.38 * cos(z);
          },
          values: [],
          correction: 2,
        },
        blackman: {
          calc: function(n: any, N: any, a: any) {
            const a0 = (1 - a) / 2;
            const a1 = 0.5;
            const a2 = a / 2;
            const z = (PI2 * n) / (N - 1);
            return a0 - a1 * cos(z) + a2 * cos(2 * z);
          },
          values: [],
          correction: 4 / 3,
        },
        blackmanHarris: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.35875 - 0.48829 * cos(z) + 0.14128 * cos(2 * z) - 0.01168 * cos(3 * z);
          },
          values: [],
          correction: 1.5594508635,
        },
        nuttall3: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.375 - 0.5 * cos(z) + 0.125 * cos(2 * z);
          },
          values: [],
          correction: 1.56,
        },
        nuttall3a: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.40897 - 0.5 * cos(z) + 0.09103 * cos(2 * z);
          },
          values: [],
          correction: 1.692,
        },
        nuttall3b: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.4243801 - 0.4973406 * cos(z) + 0.078793 * cos(2 * z);
          },
          values: [],
          correction: 1.7372527,
        },
        nuttall4: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.3125 - 0.46875 * cos(z) + 0.1875 * cos(2 * z) - 0.03125 * cos(3 * z);
          },
          values: [],
          correction: 1.454543,
        },
        nuttall4a: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.338946 - 0.481973 * cos(z) + 0.161054 * cos(2 * z) - 0.018027 * cos(3 * z);
          },
          values: [],
          correction: 1.512732763,
        },
        nuttall4b: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.355768 - 0.481973 * cos(z) + 0.144232 * cos(2 * z) - 0.012604 * cos(3 * z);
          },
          values: [],
          correction: 1.55223262,
        },
        nuttall4c: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.3635819 - 0.4891775 * cos(z) + 0.1365995 * cos(2 * z) - 0.0106411 * cos(3 * z);
          },
          values: [],
          correction: 1.57129067,
        },
        // fast decaying flat top
        sft3f: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.26526 - 0.5 * cos(z) + 0.23474 * cos(2 * z);
          },
          values: [],
          correction: 1.3610238,
        },
        sft4f: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.21706 - 0.42103 * cos(z) + 0.28294 * cos(2 * z) - 0.07897 * cos(3 * z);
          },
          values: [],
          correction: 1.2773573,
        },
        sft5f: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.1881 - 0.36923 * cos(z) + 0.28702 * cos(2 * z) - 0.13077 * cos(3 * z) + 0.02488 * cos(4 * z);
          },
          values: [],
          correction: 1.23167769,
        },
        // minimum sidelobe flat top
        sft3m: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.28235 - 0.52105 * cos(z) + 0.19659 * cos(2 * z);
          },
          values: [],
          correction: 1.39343451,
        },
        sft4m: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.241906 - 0.460841 * cos(z) + 0.2552381 * cos(2 * z) - 0.041872 * cos(3 * z);
          },
          values: [],
          correction: 1.3190596,
        },
        sft5m: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.209671 - 0.407331 * cos(z) + 0.281225 * cos(2 * z) - 0.092669 * cos(3 * z) + 0.0091036 * cos(4 * z);
          },
          values: [],
          correction: 1.26529456464,
        },
        nift: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return 0.2810639 - 0.5208972 * cos(z) + 0.1980399 * cos(2 * z);
          },
          values: [],
          correction: 1.39094182,
        },
        hpft: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.912510941 * cos(z) + 1.079173272 * cos(2 * z) - 0.1832630879 * cos(3 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        srft: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.93 * cos(z) + 1.29 * cos(2 * z) - 0.388 * cos(3 * z) + 0.028 * cos(4 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft70: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.90796 * cos(z) + 1.07349 * cos(2 * z) - 0.18199 * cos(3 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft95: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.9383379 * cos(z) + 1.3045202 * cos(2 * z) - 0.402827 * cos(3 * z) + 0.0350665 * cos(4 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft90d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.942604 * cos(z) + 1.340318 * cos(2 * z) - 0.440811 * cos(3 * z) + 0.043097 * cos(4 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft116d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.9575375 * cos(z) + 1.4780705 * cos(2 * z) - 0.6367431 * cos(3 * z) + 0.1228389 * cos(4 * z) - 0.0066288 * cos(5 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft144d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.96760033 * cos(z) + 1.57983607 * cos(2 * z) - 0.81123644 * cos(3 * z) + 0.22583558 * cos(4 * z) - 0.02773848 * cos(5 * z) + 0.0009036 * cos(6 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft196d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.97441842 * cos(z) + 1.65409888 * cos(2 * z) - 0.95788186 * cos(3 * z) + 0.3367342 * cos(4 * z) - 0.06364621 * cos(5 * z) + 0.00521942 * cos(6 * z) - 0.00010599 * cos(7 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft223d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.98298997309 * cos(z) + 1.75556083063 * cos(2 * z) - 1.19037717712 * cos(3 * z) + 0.56155440797 * cos(4 * z) - 0.17296769663 * cos(5 * z) + 0.03233247087 * cos(6 * z) - 0.00324954578 * cos(7 * z) + 0.00013801040 * cos(8 * z) - 0.00000132725 * cos(9 * z)) / N;
          },
          values: [],
          correction: 1,
        },
        hft248d: {
          calc: function(n: any, N: any) {
            const z = (PI2 * n) / (N - 1);
            return (1.0 - 1.985844164102 * cos(z) + 1.791176438506 * cos(2 * z) - 1.282075284005 * cos(3 * z) + 0.667777530266 * cos(4 * z) - 0.240160796576 * cos(5 * z) + 0.056656381764 * cos(6 * z) - 0.008134974479 * cos(7 * z) + 0.00062454465 * cos(8 * z) - 0.000019808998 * cos(9 * z) + 0.000000132974 * cos(10 * z)) / N;
          },
          values: [],
          correction: 1,
        },
      };
    }
    windowFunctions(params: any) {
      if (this.windowCalculation[params.name].values.length !== params.N) {
        if (params.n === 0) {
          this.windowCalculation[params.name].values.length = 0;
        }

        this.windowCalculation[params.name].values[params.n] = this.windowCalculation[params.name].correction * this.windowCalculation[params.name].calc(params.n, params.N, params.a);
        return this.windowCalculation[params.name].values[params.n];
      }
      return this.windowCalculation[params.name].values[0]; // TODO: I added the [0] part
    }

    forward(b: any, window: any) {
      let i; let j; let n; let k; let k2; let h; let d; let c; let s; let ik; let dx; let dy;
      n = this.fft.buffer.length;
      const winFunction = {
        name: window,
        N: n,
        a: 0.5,
        n: 0,
      };
      const w = this.windowFunctions(winFunction);
      if (typeof w === 'number') {
        for (i = 0; i < n; ++i) {
          winFunction.n = i;
          this.fft.buffer[i] = b[i] * this.windowFunctions(winFunction);
        }
      } else {
        for (i = 0; i < n; ++i) {
          this.fft.buffer[i] = b[i] * w[i];
        }
      }
      for (i = n; i--;) {
        this.fft.re[i] = this.fft.buffer[this.fft.twiddle[i]];
        this.fft.im[i] = 0.0;
      }
      for (k = 1; k < n; k = k2) {
        h = 0;
        k2 = k + k;
        d = n / k2;
        for (j = 0; j < k; j++) {
          c = this.fft.cosTable[h];
          s = this.fft.sinTable[h];
          for (i = j; i < n; i += k2) {
            ik = i + k;
            dx = s * this.fft.im[ik] + c * this.fft.re[ik];
            dy = c * this.fft.im[ik] - s * this.fft.re[ik];
            this.fft.re[ik] = this.fft.re[i] - dx;
            this.fft.re[i] += dx;
            this.fft.im[ik] = this.fft.im[i] - dy;
            this.fft.im[i] += dy;
          }
          h += d;
        }
      }
      return {
        re: this.fft.re,
        im: this.fft.im,
      };
    }
    inverse(re: any, im: any) {
      let i; let j; let n; let k; let k2; let h; let d; let c; let s; let ik; let dx; let dy;
      n = re.length;
      for (i = n; i--;) {
        j = this.fft.twiddle[i];
        this.fft.reI[i] = re[j];
        this.fft.imI[i] = -im[j];
      }
      for (k = 1; k < n; k = k2) {
        h = 0;
        k2 = k + k;
        d = n / k2;
        for (j = 0; j < k; j++) {
          c = this.fft.cosTable[h];
          s = this.fft.sinTable[h];
          for (i = j; i < n; i += k2) {
            ik = i + k;
            dx = s * this.fft.imI[ik] + c * this.fft.reI[ik];
            dy = c * this.fft.imI[ik] - s * this.fft.reI[ik];
            this.fft.reI[ik] = this.fft.reI[i] - dx;
            this.fft.reI[i] += dx;
            this.fft.imI[ik] = this.fft.imI[i] - dy;
            this.fft.imI[i] += dy;
          }
          h += d;
        }
      }
      for (i = n; i--;) {
        this.fft.buffer[i] = this.fft.reI[i] / n;
      }
      return this.fft.buffer;
    }
    magnitude(params: any) {
      const ret = [];
      for (let cnt = 0; cnt < params.re.length; cnt++) {
        ret.push(Math.sqrt(params.re[cnt] * params.re[cnt] + params.im[cnt] * params.im[cnt]));
      }
      return ret;
    }
    magToDb(b: any) {
      const ret = [];
      for (let cnt = 0; cnt < b.length; cnt++) {
        ret.push(20 * Math.log(b[cnt]) * Math.LOG10E);
      }
      return ret;
    }
    phase(params: any) {
      const ret = [];
      for (let cnt = 0; cnt < params.re.length; cnt++) {
        ret.push(Math.atan2(params.im[cnt], params.re[cnt]));
      }
      return ret;
    }
    windows() {
      const winFuncs = [];
      for (const k in this.windowCalculation) {
        winFuncs.push(k);
      }
      return winFuncs;
    }
}

export interface FftData {
        length:number
        buffer:Float64Array
        re:Float64Array
        im:Float64Array
        reI:Float64Array
        imI:Float64Array
        twiddle:Int32Array
        sinTable:Float64Array
        cosTable:Float64Array
}
