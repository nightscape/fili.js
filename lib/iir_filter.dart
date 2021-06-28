import 'dart:math';

import 'package:fili.dart/complex.dart';
import 'package:fili.dart/fir_filter.dart';

import 'filter.dart';
import 'utils.dart';

// params: array of biquad coefficient objects and z registers
// stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
class IirFilter implements Filter {
  List<dynamic> cf = [];
  List<dynamic> cc = [];
  Complex cone = Complex(
    1,
    0,
  );
  dynamic f;
  constructor(dynamic filter) {
    this.f = filter;

    for (var cnt = 0; cnt < this.f.length; cnt++) {
      this.cf[cnt] = {};
      var s = this.f[cnt];
      this.cf[cnt].b0 = Complex(s.b[0], 0);
      this.cf[cnt].b1 = Complex(s.b[1], 0);
      this.cf[cnt].b2 = Complex(s.b[2], 0);
      this.cf[cnt].a1 = Complex(s.a[0], 0);
      this.cf[cnt].a2 = Complex(s.a[1], 0);
      this.cf[cnt].k = Complex(s.k, 0);
      this.cf[cnt].z = [0, 0];
      this.cc[cnt] = {};
      this.cc[cnt].b1 = s.b[1] / s.b[0];
      this.cc[cnt].b2 = s.b[2] / s.b[0];
      this.cc[cnt].a1 = s.a[0];
      this.cc[cnt].a2 = s.a[1];
    }
  }

  runStage(dynamic s, dynamic input) {
    var temp = input * s.k.re - s.a1.re * s.z[0] - s.a2.re * s.z[1];
    var out = s.b0.re * temp + s.b1.re * s.z[0] + s.b2.re * s.z[1];
    s.z[1] = s.z[0];
    s.z[0] = temp;
    return out;
  }

  double doStep(double input, dynamic coeffs) {
    var out = input;
    for (var cnt = 0; cnt < coeffs.length; cnt++) {
      out = this.runStage(coeffs[cnt], out);
    }
    return out;
  }

  biquadResponse(dynamic params, dynamic s) {
    var Fs = params.Fs;
    var Fr = params.Fr;
    // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
    // z^-1 = exp(-j*omega*pi)
    // omega is between 0 and 1. 1 is the Nyquist frequency.
    var theta = -pi * (Fr / Fs) * 2;
    var z = Complex(cos(theta), sin(theta));
    // k * (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^⁻1 + a2*z^-2)
    var p = s.k.mul(s.b0.add(z.mul(s.b1.add(s.b2.mul(z)))));
    var q = this.cone.add(z.mul(s.a1.add(s.a2.mul(z))));
    var h = p.div(q);
    var res = {
      "magnitude": h.magnitude(),
      "phase": h.phase(),
    };
    return res;
  }

  calcResponse(dynamic params) {
    var res = FilterResponse(
      magnitude: 1,
      phase: 0,
      dBmagnitude: 0,
    );
    for (var cnt = 0; cnt < this.cf.length; cnt++) {
      var r = this.biquadResponse(params, this.cf[cnt]);
      // a cascade of biquads results in the multiplication of H(z)
      // H_casc(z) = H_0(z) * H_1(z) * ... * H_n(z)
      res.magnitude = res.magnitude! * r.magnitude!;
      // phase is wrapped -> unwrap before using
      res.phase = res.phase! + r.phase!;
    }
    res.dBmagnitude = 20 * log(res.magnitude!) * log10e;
    return res;
  }

  reinit() {
    var tempF = [];
    for (var cnt = 0; cnt < this.f.length; cnt++) {
      var s = this.f[cnt];
      tempF[cnt] = {
        b0: Complex(s.b[0], 0),
        b1: Complex(s.b[1], 0),
        b2: Complex(s.b[2], 0),
        a1: Complex(s.a[0], 0),
        a2: Complex(s.a[1], 0),
        k: Complex(s.k, 0),
        z: [0, 0],
      };
    }
    return tempF;
  }

  calcInputResponse(List<double> input) {
    var tempF = this.reinit();
    return runMultiFilter(
        input, tempF, (input, coeffs) => this.doStep(input, coeffs));
  }

  predefinedResponse(dynamic def, dynamic length) {
    var ret = {};
    List<double> input = [];
    for (var cnt = 0; cnt < length; cnt++) {
      input.add(def(cnt));
    }
    (ret as dynamic).out = this.calcInputResponse(input);
    var maxFound = false;
    var minFound = false;
    for (var cnt = 0; cnt < length - 1; cnt++) {
      if ((ret as dynamic).out[cnt] > (ret as dynamic).out[cnt + 1] &&
          !maxFound) {
        maxFound = true;
        (ret as dynamic).max = {
          sample: cnt,
          value: (ret as dynamic).out[cnt],
        };
      }
      if (maxFound &&
          !minFound &&
          (ret as dynamic).out[cnt] < (ret as dynamic).out[cnt + 1]) {
        minFound = true;
        (ret as dynamic).min = {
          sample: cnt,
          value: (ret as dynamic).out[cnt],
        };
        break;
      }
    }
    return ret;
  }

  getComplRes(dynamic n1, dynamic n2) {
    var innerSqrt = pow(n1 / 2, 2) - n2;
    if (innerSqrt < 0) {
      return [
        Complex(-n1 / 2, sqrt(innerSqrt.abs())),
        Complex(-n1 / 2, -sqrt(innerSqrt.abs()))
      ];
    } else {
      return [
        Complex(-n1 / 2 + sqrt(innerSqrt), 0),
        Complex(-n1 / 2 - sqrt(innerSqrt), 0)
      ];
    }
  }

  getPZ() {
    var res = [];
    for (var cnt = 0; cnt < this.cc.length; cnt++) {
      res[cnt] = {};
      (res[cnt] as dynamic).z =
          this.getComplRes(this.cc[cnt].b1, this.cc[cnt].b2);
      (res[cnt] as dynamic).p =
          this.getComplRes(this.cc[cnt].a1, this.cc[cnt].a2);
    }
    return res;
  }

  double singleStep(double input) {
    return this.doStep(input, this.cf);
  }

  multiStep(dynamic input, bool overwrite) {
    return runMultiFilter(
        input, this.cf, (input, coeffs) => this.doStep(input, coeffs),
        overwrite: overwrite);
  }

  filtfilt(dynamic input, bool overwrite) {
    return runMultiFilterReverse(
        runMultiFilter(
            input, this.cf, (input, coeffs) => this.doStep(input, coeffs),
            overwrite: overwrite),
        this.cf,
        this.doStep,
        overwrite: true);
  }

  simulate(dynamic input) {
    return this.calcInputResponse(input);
  }

  stepResponse(dynamic length) {
    return this.predefinedResponse(() {
      return 1;
    }, length);
  }

  impulseResponse(dynamic length) {
    return this.predefinedResponse((val) {
      if (val == 0) {
        return 1;
      } else {
        return 0;
      }
    }, length);
  }

  responsePoint(dynamic params) {
    return this.calcResponse(params);
  }

  response(int? resolution) {
    resolution = resolution ?? 100;
    var res = [];
    var r = resolution * 2;
    for (var cnt = 0; cnt < resolution; cnt++) {
      res[cnt] = this.calcResponse(
        Fs: r,
        Fr: cnt,
      );
    }
    evaluatePhase(res);
    return res;
  }

  polesZeros() {
    return this.getPZ();
  }

  reInit() {
    for (var cnt = 0; cnt < this.cf.length; cnt++) {
      this.cf[cnt].z = [0, 0];
    }
  }
}
