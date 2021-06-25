'use strict';
var Fft = function (radix: any) {
    var isPowerOfTwo = function (value: any) {
        if (!(value & value - 1)) {
            return true;
        }
        return false;
    };
    if (!isPowerOfTwo(radix)) {
        return false;
    }
    var fft = {};
    (fft as any).length = radix;
    (fft as any).buffer = new Float64Array(radix);
    (fft as any).re = new Float64Array(radix);
    (fft as any).im = new Float64Array(radix);
    (fft as any).reI = new Float64Array(radix);
    (fft as any).imI = new Float64Array(radix);
    (fft as any).twiddle = new Int32Array(radix);
    (fft as any).sinTable = new Float64Array(radix - 1);
    (fft as any).cosTable = new Float64Array(radix - 1);
    var TPI = 2 * Math.PI;
    var bits = Math.floor(Math.log(radix) / Math.LN2);
    for (i = (fft as any).sinTable.length; i--;) {
        (fft as any).sinTable[i] = Math.sin(TPI * (i / radix));
        (fft as any).cosTable[i] = Math.cos(TPI * (i / radix));
    }
    var nh = radix >> 1;
    var i = 0;
    var j = 0;
    for (;;) {
        (fft as any).twiddle[i] = j;
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
    var PI = Math.PI;
    var PI2 = Math.PI * 2;
    var abs = Math.abs;
    var pow = Math.pow;
    var cos = Math.cos;
    var sin = Math.sin;
    var sinc = function (x: any) {
        return sin(PI * x) / (PI * x);
    };
    var E = Math.E;
    var windowCalculation = {
        rectangular: {
            calc: function () {
                return 1;
            },
            values: [],
            correction: 1
        },
        none: {
            calc: function () {
                return 1;
            },
            values: [],
            correction: 1
        },
        hanning: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.5 * (1 - cos(z));
            },
            values: [],
            correction: 2
        },
        hamming: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.54 - 0.46 * cos(z);
            },
            values: [],
            correction: 1.8518999946875638
        },
        tukery: {
            calc: function (n: any, N: any, a: any) {
                if (n < (a * (N - 1)) / 2) {
                    return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - 1)));
                }
                else if ((N - 1) * (1 - (a / 2)) < n) {
                    return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - (2 / a) + 1)));
                }
                else {
                    return 1;
                }
            },
            values: [],
            correction: 4 / 3
        },
        cosine: {
            calc: function (n: any, N: any) {
                return sin((PI * n) / (N - 1));
            },
            values: [],
            correction: 1.570844266360796
        },
        lanczos: {
            calc: function (n: any, N: any) {
                return sinc(((2 * n) / (N - 1)) - 1);
            },
            values: [],
            correction: 1.6964337576195783
        },
        triangular: {
            calc: function (n: any, N: any) {
                return (2 / (N + 1)) * (((N + 1) / 2) - abs(n - ((N - 1) / 2)));
            },
            values: [],
            correction: 2
        },
        bartlett: {
            calc: function (n: any, N: any) {
                return (2 / (N - 1)) * (((N - 1) / 2) - abs(n - ((N - 1) / 2)));
            },
            values: [],
            correction: 2
        },
        gaussian: {
            calc: function (n: any, N: any, a: any) {
                return pow(E, -0.5 * pow((n - (N - 1) / 2) / (a * (N - 1) / 2), 2));
            },
            values: [],
            correction: 5 / 3
        },
        bartlettHanning: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.62 - 0.48 * abs((n / (N - 1)) - 0.5) - 0.38 * cos(z);
            },
            values: [],
            correction: 2
        },
        blackman: {
            calc: function (n: any, N: any, a: any) {
                var a0 = (1 - a) / 2;
                var a1 = 0.5;
                var a2 = a / 2;
                var z = (PI2 * n) / (N - 1);
                return a0 - a1 * cos(z) + a2 * cos(2 * z);
            },
            values: [],
            correction: 4 / 3
        },
        blackmanHarris: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.35875 - 0.48829 * cos(z) + 0.14128 * cos(2 * z) - 0.01168 * cos(3 * z);
            },
            values: [],
            correction: 1.5594508635
        },
        nuttall3: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.375 - 0.5 * cos(z) + 0.125 * cos(2 * z);
            },
            values: [],
            correction: 1.56
        },
        nuttall3a: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.40897 - 0.5 * cos(z) + 0.09103 * cos(2 * z);
            },
            values: [],
            correction: 1.692
        },
        nuttall3b: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.4243801 - 0.4973406 * cos(z) + 0.078793 * cos(2 * z);
            },
            values: [],
            correction: 1.7372527
        },
        nuttall4: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.3125 - 0.46875 * cos(z) + 0.1875 * cos(2 * z) - 0.03125 * cos(3 * z);
            },
            values: [],
            correction: 1.454543
        },
        nuttall4a: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.338946 - 0.481973 * cos(z) + 0.161054 * cos(2 * z) - 0.018027 * cos(3 * z);
            },
            values: [],
            correction: 1.512732763
        },
        nuttall4b: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.355768 - 0.481973 * cos(z) + 0.144232 * cos(2 * z) - 0.012604 * cos(3 * z);
            },
            values: [],
            correction: 1.55223262
        },
        nuttall4c: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.3635819 - 0.4891775 * cos(z) + 0.1365995 * cos(2 * z) - 0.0106411 * cos(3 * z);
            },
            values: [],
            correction: 1.57129067
        },
        // fast decaying flat top
        sft3f: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.26526 - 0.5 * cos(z) + 0.23474 * cos(2 * z);
            },
            values: [],
            correction: 1.3610238
        },
        sft4f: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.21706 - 0.42103 * cos(z) + 0.28294 * cos(2 * z) - 0.07897 * cos(3 * z);
            },
            values: [],
            correction: 1.2773573
        },
        sft5f: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.1881 - 0.36923 * cos(z) + 0.28702 * cos(2 * z) - 0.13077 * cos(3 * z) + 0.02488 * cos(4 * z);
            },
            values: [],
            correction: 1.23167769
        },
        // minimum sidelobe flat top
        sft3m: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.28235 - 0.52105 * cos(z) + 0.19659 * cos(2 * z);
            },
            values: [],
            correction: 1.39343451
        },
        sft4m: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.241906 - 0.460841 * cos(z) + 0.2552381 * cos(2 * z) - 0.041872 * cos(3 * z);
            },
            values: [],
            correction: 1.3190596
        },
        sft5m: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.209671 - 0.407331 * cos(z) + 0.281225 * cos(2 * z) - 0.092669 * cos(3 * z) + 0.0091036 * cos(4 * z);
            },
            values: [],
            correction: 1.26529456464
        },
        nift: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return 0.2810639 - 0.5208972 * cos(z) + 0.1980399 * cos(2 * z);
            },
            values: [],
            correction: 1.39094182
        },
        hpft: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.912510941 * cos(z) + 1.079173272 * cos(2 * z) - 0.1832630879 * cos(3 * z)) / N;
            },
            values: [],
            correction: 1
        },
        srft: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.93 * cos(z) + 1.29 * cos(2 * z) - 0.388 * cos(3 * z) + 0.028 * cos(4 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft70: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.90796 * cos(z) + 1.07349 * cos(2 * z) - 0.18199 * cos(3 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft95: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.9383379 * cos(z) + 1.3045202 * cos(2 * z) - 0.402827 * cos(3 * z) + 0.0350665 * cos(4 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft90d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.942604 * cos(z) + 1.340318 * cos(2 * z) - 0.440811 * cos(3 * z) + 0.043097 * cos(4 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft116d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.9575375 * cos(z) + 1.4780705 * cos(2 * z) - 0.6367431 * cos(3 * z) + 0.1228389 * cos(4 * z) - 0.0066288 * cos(5 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft144d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.96760033 * cos(z) + 1.57983607 * cos(2 * z) - 0.81123644 * cos(3 * z) + 0.22583558 * cos(4 * z) - 0.02773848 * cos(5 * z) + 0.0009036 * cos(6 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft196d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.97441842 * cos(z) + 1.65409888 * cos(2 * z) - 0.95788186 * cos(3 * z) + 0.3367342 * cos(4 * z) - 0.06364621 * cos(5 * z) + 0.00521942 * cos(6 * z) - 0.00010599 * cos(7 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft223d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.98298997309 * cos(z) + 1.75556083063 * cos(2 * z) - 1.19037717712 * cos(3 * z) + 0.56155440797 * cos(4 * z) - 0.17296769663 * cos(5 * z) + 0.03233247087 * cos(6 * z) - 0.00324954578 * cos(7 * z) + 0.00013801040 * cos(8 * z) - 0.00000132725 * cos(9 * z)) / N;
            },
            values: [],
            correction: 1
        },
        hft248d: {
            calc: function (n: any, N: any) {
                var z = (PI2 * n) / (N - 1);
                return (1.0 - 1.985844164102 * cos(z) + 1.791176438506 * cos(2 * z) - 1.282075284005 * cos(3 * z) + 0.667777530266 * cos(4 * z) - 0.240160796576 * cos(5 * z) + 0.056656381764 * cos(6 * z) - 0.008134974479 * cos(7 * z) + 0.00062454465 * cos(8 * z) - 0.000019808998 * cos(9 * z) + 0.000000132974 * cos(10 * z)) / N;
            },
            values: [],
            correction: 1
        }
    };
    var windowFunctions = function (params: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (windowCalculation[params.name].values.length !== params.N) {
            if (params.n === 0) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                windowCalculation[params.name].values.length = 0;
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            windowCalculation[params.name].values[params.n] = windowCalculation[params.name].correction * windowCalculation[params.name].calc(params.n, params.N, params.a);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return windowCalculation[params.name].values[params.n];
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return windowCalculation[params.name].values;
    };
    var self = {
        forward: function (b: any, window: any) {
            var i, j, n, k, k2, h, d, c, s, ik, dx, dy;
            n = (fft as any).buffer.length;
            var winFunction = {
                name: window,
                N: n,
                a: 0.5,
                n: 0
            };
            var w = windowFunctions(winFunction);
            if (typeof w === 'number') {
                for (i = 0; i < n; ++i) {
                    winFunction.n = i;
                    (fft as any).buffer[i] = b[i] * windowFunctions(winFunction);
                }
            }
            else {
                for (i = 0; i < n; ++i) {
                    (fft as any).buffer[i] = b[i] * w[i];
                }
            }
            for (i = n; i--;) {
                (fft as any).re[i] = (fft as any).buffer[(fft as any).twiddle[i]];
                (fft as any).im[i] = 0.0;
            }
            for (k = 1; k < n; k = k2) {
                h = 0;
                k2 = k + k;
                d = n / k2;
                for (j = 0; j < k; j++) {
                    c = (fft as any).cosTable[h];
                    s = (fft as any).sinTable[h];
                    for (i = j; i < n; i += k2) {
                        ik = i + k;
                        dx = s * (fft as any).im[ik] + c * (fft as any).re[ik];
                        dy = c * (fft as any).im[ik] - s * (fft as any).re[ik];
                        (fft as any).re[ik] = (fft as any).re[i] - dx;
                        (fft as any).re[i] += dx;
                        (fft as any).im[ik] = (fft as any).im[i] - dy;
                        (fft as any).im[i] += dy;
                    }
                    h += d;
                }
            }
            return {
                re: (fft as any).re,
                im: (fft as any).im
            };
        },
        inverse: function (re: any, im: any) {
            var i, j, n, k, k2, h, d, c, s, ik, dx, dy;
            n = re.length;
            for (i = n; i--;) {
                j = (fft as any).twiddle[i];
                (fft as any).reI[i] = re[j];
                (fft as any).imI[i] = -im[j];
            }
            for (k = 1; k < n; k = k2) {
                h = 0;
                k2 = k + k;
                d = n / k2;
                for (j = 0; j < k; j++) {
                    c = (fft as any).cosTable[h];
                    s = (fft as any).sinTable[h];
                    for (i = j; i < n; i += k2) {
                        ik = i + k;
                        dx = s * (fft as any).imI[ik] + c * (fft as any).reI[ik];
                        dy = c * (fft as any).imI[ik] - s * (fft as any).reI[ik];
                        (fft as any).reI[ik] = (fft as any).reI[i] - dx;
                        (fft as any).reI[i] += dx;
                        (fft as any).imI[ik] = (fft as any).imI[i] - dy;
                        (fft as any).imI[i] += dy;
                    }
                    h += d;
                }
            }
            for (i = n; i--;) {
                (fft as any).buffer[i] = (fft as any).reI[i] / n;
            }
            return (fft as any).buffer;
        },
        magnitude: function (params: any) {
            var ret = [];
            for (var cnt = 0; cnt < params.re.length; cnt++) {
                ret.push(Math.sqrt(params.re[cnt] * params.re[cnt] + params.im[cnt] * params.im[cnt]));
            }
            return ret;
        },
        magToDb: function (b: any) {
            var ret = [];
            for (var cnt = 0; cnt < b.length; cnt++) {
                ret.push(20 * Math.log(b[cnt]) * Math.LOG10E);
            }
            return ret;
        },
        phase: function (params: any) {
            var ret = [];
            for (var cnt = 0; cnt < params.re.length; cnt++) {
                ret.push(Math.atan2(params.im[cnt], params.re[cnt]));
            }
            return ret;
        },
        windows: function () {
            var winFuncs = [];
            for (var k in windowCalculation) {
                winFuncs.push(k);
            }
            return winFuncs;
        }
    };
    return self;
};
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = Fft;
