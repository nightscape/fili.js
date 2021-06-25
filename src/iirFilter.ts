'use strict';
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var { complex, runMultiFilter, runMultiFilterReverse, evaluatePhase } = require('./utils');
// params: array of biquad coefficient objects and z registers
// stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
var IirFilter = function (filter: any) {
    var f = filter;
    var cone = {
        re: 1,
        im: 0
    };
    var cf: any = [];
    var cc: any = [];
    for (var cnt = 0; cnt < f.length; cnt++) {
        cf[cnt] = {};
        var s = f[cnt];
        cf[cnt].b0 = {
            re: s.b[0],
            im: 0
        };
        cf[cnt].b1 = {
            re: s.b[1],
            im: 0
        };
        cf[cnt].b2 = {
            re: s.b[2],
            im: 0
        };
        cf[cnt].a1 = {
            re: s.a[0],
            im: 0
        };
        cf[cnt].a2 = {
            re: s.a[1],
            im: 0
        };
        cf[cnt].k = {
            re: s.k,
            im: 0
        };
        cf[cnt].z = [0, 0];
        cc[cnt] = {};
        cc[cnt].b1 = s.b[1] / s.b[0];
        cc[cnt].b2 = s.b[2] / s.b[0];
        cc[cnt].a1 = s.a[0];
        cc[cnt].a2 = s.a[1];
    }
    var runStage = function (s: any, input: any) {
        var temp = input * s.k.re - s.a1.re * s.z[0] - s.a2.re * s.z[1];
        var out = s.b0.re * temp + s.b1.re * s.z[0] + s.b2.re * s.z[1];
        s.z[1] = s.z[0];
        s.z[0] = temp;
        return out;
    };
    var doStep = function (input: any, coeffs: any) {
        var out = input;
        var cnt = 0;
        for (cnt = 0; cnt < coeffs.length; cnt++) {
            out = runStage(coeffs[cnt], out);
        }
        return out;
    };
    var biquadResponse = function (params: any, s: any) {
        var Fs = params.Fs;
        var Fr = params.Fr;
        // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
        // z^-1 = exp(-j*omega*pi)
        // omega is between 0 and 1. 1 is the Nyquist frequency.
        var theta = -Math.PI * (Fr / Fs) * 2;
        var z = {
            re: Math.cos(theta),
            im: Math.sin(theta)
        };
        // k * (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^⁻1 + a2*z^-2)
        var p = complex.mul(s.k, complex.add(s.b0, complex.mul(z, complex.add(s.b1, complex.mul(s.b2, z)))));
        var q = complex.add(cone, complex.mul(z, complex.add(s.a1, complex.mul(s.a2, z))));
        var h = complex.div(p, q);
        var res = {
            magnitude: complex.magnitude(h),
            phase: complex.phase(h)
        };
        return res;
    };
    var calcResponse = function (params: any) {
        var cnt = 0;
        var res = {
            magnitude: 1,
            phase: 0
        };
        for (cnt = 0; cnt < cf.length; cnt++) {
            var r = biquadResponse(params, cf[cnt]);
            // a cascade of biquads results in the multiplication of H(z)
            // H_casc(z) = H_0(z) * H_1(z) * ... * H_n(z)
            res.magnitude *= r.magnitude;
            // phase is wrapped -> unwrap before using
            res.phase += r.phase;
        }
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'dBmagnitude' does not exist on type '{ m... Remove this comment to see the full error message
        res.dBmagnitude = 20 * Math.log(res.magnitude) * Math.LOG10E;
        return res;
    };
    var reinit = function () {
        var tempF = [];
        for (var cnt = 0; cnt < f.length; cnt++) {
            tempF[cnt] = {
                b0: {
                    re: s.b[0],
                    im: 0
                },
                b1: {
                    re: s.b[1],
                    im: 0
                },
                b2: {
                    re: s.b[2],
                    im: 0
                },
                a1: {
                    re: s.a[0],
                    im: 0
                },
                a2: {
                    re: s.a[1],
                    im: 0
                },
                k: {
                    re: s.k,
                    im: 0
                },
                z: [0, 0]
            };
        }
        return tempF;
    };
    var calcInputResponse = function (input: any) {
        var tempF = reinit();
        return runMultiFilter(input, tempF, doStep);
    };
    var predefinedResponse = function (def: any, length: any) {
        var ret = {};
        var input = [];
        var cnt = 0;
        for (cnt = 0; cnt < length; cnt++) {
            input.push(def(cnt));
        }
        (ret as any).out = calcInputResponse(input);
        var maxFound = false;
        var minFound = false;
        for (cnt = 0; cnt < length - 1; cnt++) {
            if ((ret as any).out[cnt] > (ret as any).out[cnt + 1] && !maxFound) {
                maxFound = true;
                (ret as any).max = {
                    sample: cnt,
                    value: (ret as any).out[cnt]
                };
            }
            if (maxFound && !minFound && (ret as any).out[cnt] < (ret as any).out[cnt + 1]) {
                minFound = true;
                (ret as any).min = {
                    sample: cnt,
                    value: (ret as any).out[cnt]
                };
                break;
            }
        }
        return ret;
    };
    var getComplRes = function (n1: any, n2: any) {
        var innerSqrt = Math.pow(n1 / 2, 2) - n2;
        if (innerSqrt < 0) {
            return [{
                    re: -n1 / 2,
                    im: Math.sqrt(Math.abs(innerSqrt))
                }, {
                    re: -n1 / 2,
                    im: -Math.sqrt(Math.abs(innerSqrt))
                }];
        }
        else {
            return [{
                    re: -n1 / 2 + Math.sqrt(innerSqrt),
                    im: 0
                }, {
                    re: -n1 / 2 - Math.sqrt(innerSqrt),
                    im: 0
                }];
        }
    };
    var getPZ = function () {
        var res = [];
        for (var cnt = 0; cnt < cc.length; cnt++) {
            res[cnt] = {};
            (res[cnt] as any).z = getComplRes(cc[cnt].b1, cc[cnt].b2);
            (res[cnt] as any).p = getComplRes(cc[cnt].a1, cc[cnt].a2);
        }
        return res;
    };
    var self = {
        singleStep: function (input: any) {
            return doStep(input, cf);
        },
        multiStep: function (input: any, overwrite: any) {
            return runMultiFilter(input, cf, doStep, overwrite);
        },
        filtfilt: function (input: any, overwrite: any) {
            return runMultiFilterReverse(runMultiFilter(input, cf, doStep, overwrite), cf, doStep, true);
        },
        simulate: function (input: any) {
            return calcInputResponse(input);
        },
        stepResponse: function (length: any) {
            return predefinedResponse(function () {
                return 1;
            }, length);
        },
        impulseResponse: function (length: any) {
            return predefinedResponse(function (val: any) {
                if (val === 0) {
                    return 1;
                }
                else {
                    return 0;
                }
            }, length);
        },
        responsePoint: function (params: any) {
            return calcResponse(params);
        },
        response: function (resolution: any) {
            resolution = resolution || 100;
            var res = [];
            var cnt = 0;
            var r = resolution * 2;
            for (cnt = 0; cnt < resolution; cnt++) {
                res[cnt] = calcResponse({
                    Fs: r,
                    Fr: cnt
                });
            }
            evaluatePhase(res);
            return res;
        },
        polesZeros: function () {
            return getPZ();
        },
        reinit: function () {
            for (cnt = 0; cnt < cf.length; cnt++) {
                cf[cnt].z = [0, 0];
            }
        }
    };
    return self;
};
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = IirFilter;
