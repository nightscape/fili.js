import 'dart:collection';
import 'dart:math';
import 'complex.dart';
import 'math_ext.dart';

abstract class Coeffs {
  double a0;
  List<double> a;
  List<double> b;
  double k;
  double alpha;
  double cw;
  double A;
  double wp;
  double wp2;
  List<double> z;
  Coeffs({
    required this.a0,
    required this.a,
    required this.b,
    required this.k,
    required this.alpha,
    required this.cw,
    required this.A,
    required this.wp,
    required this.wp2,
    required this.z,
  });
}

class IirCoeffs extends MapBase<String, Coeffs Function(IirParams)> {
  static preCalc(BWFcFsQParams params, dynamic coeffs) {
    var Q = params.Q;
    var Fc = params.Fc;
    var Fs = params.Fs;
    var pre = {} as Coeffs;
    var w = 2 * pi * Fc / Fs;
    if (params.BW != null) {
      pre.alpha = sin(w) * (log(2) / 2 * params.BW! * w / sin(w)).sinh();
    } else {
      pre.alpha = sin(w) / (2 * Q);
    }
    pre.cw = cos(w);
    pre.a0 = 1 + pre.alpha;
    coeffs.a0 = pre.a0;
    coeffs.a.add((-2 * pre.cw) / pre.a0);
    coeffs.k = 1;
    coeffs.a.add((1 - pre.alpha) / pre.a0);
    return pre;
  }

  static preCalcGain(IirParams iparams) {
    final params = iparams as FcFsQParams;
    var Q = params.Q!;
    var Fc = params.Fc!;
    var Fs = params.Fs!;
    var pre = {} as Coeffs;
    var w = 2 * pi * Fc / Fs;
    pre.alpha = sin(w) / (2 * Q);
    pre.cw = cos(w);
    pre.A = pow(10, params.gain! / 40).toDouble();
    return pre;
  }

  static Coeffs initCoeffs() {
    var coeffs = {} as Coeffs;
    coeffs.z = [0, 0];
    coeffs.a = [];
    coeffs.b = [];
    return coeffs;
  }

  Coeffs fromPZ(IirParams iparams) {
    final params = iparams as PZParams;
    var coeffs = IirCoeffs.initCoeffs();
    coeffs.a0 = 1;
    coeffs.b.add(1);
    var z0 = params.z0;
    var z1 = params.z1;

    coeffs.b.add(-z0.re - z1.re);
    coeffs.b.add(z0.re * z1.re - z0.im * z1.im);
    var p0 = params.p0;
    var p1 = params.p1;
    coeffs.a.add(-p0.re - p1.re);
    coeffs.a.add(p0.re * p1.re - p0.im * p1.im);
    if (params.type == 'lowpass') {
      coeffs.k =
          (1 + coeffs.a[0] + coeffs.a[1]) / (1 + coeffs.b[1] + coeffs.b[2]);
    } else {
      coeffs.k =
          (1 - coeffs.a[0] + coeffs.a[1]) / (1 - coeffs.b[1] + coeffs.b[2]);
    }
    return coeffs;
  }

  // lowpass matched-z transform: H(s) = 1/(1+a's/w_c+b's^2/w_c)
  Coeffs lowpassMZ(IirParams iparams) {
    final params = iparams as FcFsQParams;
    var coeffs = IirCoeffs.initCoeffs();
    coeffs.a0 = 1;
    var as = params.as!;
    var bs = params.bs!;
    var w = 2 * pi * params.Fc / params.Fs;
    var s = -(as / (2 * bs));
    coeffs.a.add(-pow(e, s * w) *
        2 *
        cos(-w * sqrt((pow(as, 2) / (4 * pow(bs, 2)) - 1 / bs).abs())));
    coeffs.a.add(pow(e, 2 * s * w).toDouble());
    // correct gain
    if (params.preGain == null) {
      coeffs.b.add(coeffs.a0 + coeffs.a[0] + coeffs.a[1]);
      coeffs.k = 1;
    } else {
      coeffs.b.add(1);
      coeffs.k = coeffs.a0 + coeffs.a[0] + coeffs.a[1];
    }
    coeffs.b.add(0);
    coeffs.b.add(0);
    return coeffs;
  }

  // Bessel-Thomson: H(s) = 3/(s^2+3*s+3)
  Coeffs lowpassBT(IirParams iparams) {
    final params = iparams as FcFsQParams;
    var coeffs = IirCoeffs.initCoeffs();
    params.Q = 1;
    coeffs.wp = tan((2 * pi * params.Fc) / (2 * params.Fs));
    coeffs.wp2 = coeffs.wp * coeffs.wp;
//      if (params.BW) {
//        delete params.BW;
//      }
    coeffs.k = 1;
    coeffs.a0 = 3 * coeffs.wp + 3 * coeffs.wp2 + 1;
    coeffs.b.add(3 * coeffs.wp2 * params.Q / coeffs.a0);
    coeffs.b.add(2 * coeffs.b[0]);
    coeffs.b.add(coeffs.b[0]);
    coeffs.a.add((6 * coeffs.wp2 - 2) / coeffs.a0);
    coeffs.a.add((3 * coeffs.wp2 - 3 * coeffs.wp + 1) / coeffs.a0);
    return coeffs;
  }

  Coeffs highpassBT(IirParams iparams) {
    final params = iparams as FcFsQParams;
    var coeffs = IirCoeffs.initCoeffs();
    params.Q = 1;
    coeffs.wp = tan((2 * pi * params.Fc) / (2 * params.Fs));
    coeffs.wp2 = coeffs.wp * coeffs.wp;
//      if (params.BW) {
//        delete params.BW;
//      }
    coeffs.k = 1;
    coeffs.a0 = coeffs.wp + coeffs.wp2 + 3;
    coeffs.b.add(3 * params.Q / coeffs.a0);
    coeffs.b.add(2 * coeffs.b[0]);
    coeffs.b.add(coeffs.b[0]);
    coeffs.a.add((2 * coeffs.wp2 - 6) / coeffs.a0);
    coeffs.a.add((coeffs.wp2 - coeffs.wp + 3) / coeffs.a0);
    return coeffs;
  }

  /*
     * Formulas from http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
     */
  // H(s) = 1 / (s^2 + s/Q + 1)
  Coeffs lowpass(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
//      if (params.BW) {
//        delete params.BW;
//      }
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    if (params.preGain != null) {
      coeffs.k = (1 - p.cw) * 0.5;
      coeffs.b.add(1 / (p.a0));
    } else {
      coeffs.k = 1;
      coeffs.b.add((1 - p.cw) / (2 * p.a0));
    }
    coeffs.b.add(2 * coeffs.b[0]);
    coeffs.b.add(coeffs.b[0]);
    return coeffs;
  }

  // H(s) = s^2 / (s^2 + s/Q + 1)
  Coeffs highpass(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
//      if (params.BW) {
//        delete params.BW;
//      }
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    if (params.preGain != null) {
      coeffs.k = (1 + p.cw) * 0.5;
      coeffs.b.add(1 / (p.a0));
    } else {
      coeffs.k = 1;
      coeffs.b.add((1 + p.cw) / (2 * p.a0));
    }
    coeffs.b.add(-2 * coeffs.b[0]);
    coeffs.b.add(coeffs.b[0]);
    return coeffs;
  }

  // H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1)
  Coeffs allpass(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
//      if (params.BW) {
//        delete params.BW;
//      }
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    coeffs.k = 1;
    coeffs.b.add((1 - p.alpha) / p.a0);
    coeffs.b.add(-2 * p.cw / p.a0);
    coeffs.b.add((1 + p.alpha) / p.a0);
    return coeffs;
  }

  // H(s) = s / (s^2 + s/Q + 1)
  Coeffs bandpassQ(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    coeffs.k = 1;
    coeffs.b.add(p.alpha * params.Q / p.a0);
    coeffs.b.add(0);
    coeffs.b.add(-coeffs.b[0]);
    return coeffs;
  }

  // H(s) = (s/Q) / (s^2 + s/Q + 1)
  Coeffs bandpass(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    coeffs.k = 1;
    coeffs.b.add(p.alpha / p.a0);
    coeffs.b.add(0);
    coeffs.b.add(-coeffs.b[0]);
    return coeffs;
  }

  // H(s) = (s^2 + 1) / (s^2 + s/Q + 1)
  Coeffs bandstop(IirParams iparams) {
    var coeffs = IirCoeffs.initCoeffs();
    final params = iparams as BWFcFsQParams;
    var p = IirCoeffs.preCalc(params, coeffs);
    coeffs.k = 1;
    coeffs.b.add(1 / p.a0);
    coeffs.b.add(-2 * p.cw / p.a0);
    coeffs.b.add(coeffs.b[0]);
    return coeffs;
  }

  // H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1)
  Coeffs peak(IirParams params) {
    var coeffs = IirCoeffs.initCoeffs();
    var p = IirCoeffs.preCalcGain(params);
    coeffs.k = 1;
    coeffs.a0 = (1 + p.alpha / p.A).toDouble();
    coeffs.a.add(-2 * p.cw / coeffs.a0);
    coeffs.a.add((1 - p.alpha / p.A) / coeffs.a0);
    coeffs.b.add((1 + p.alpha * p.A) / coeffs.a0);
    coeffs.b.add(-2 * p.cw / coeffs.a0);
    coeffs.b.add((1 - p.alpha * p.A) / coeffs.a0);
    return coeffs;
  }

  // H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1)
  Coeffs lowshelf(IirParams params) {
    var coeffs = IirCoeffs.initCoeffs();
//      if (params.BW) {
//        delete params.BW;
//      }
    var p = IirCoeffs.preCalcGain(params);
    coeffs.k = 1;
    var sa = 2 * sqrt(p.A) * p.alpha;
    coeffs.a0 = (p.A + 1) + (p.A - 1) * p.cw + sa;
    coeffs.a.add((-2 * ((p.A - 1) + (p.A + 1) * p.cw)) / coeffs.a0);
    coeffs.a.add(((p.A + 1) + (p.A - 1) * p.cw - sa) / coeffs.a0);
    coeffs.b.add((p.A * ((p.A + 1) - (p.A - 1) * p.cw + sa)) / coeffs.a0);
    coeffs.b.add((2 * p.A * ((p.A - 1) - (p.A + 1) * p.cw)) / coeffs.a0);
    coeffs.b.add((p.A * ((p.A + 1) - (p.A - 1) * p.cw - sa)) / coeffs.a0);
    return coeffs;
  }

  // H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A)
  Coeffs highshelf(IirParams params) {
    var coeffs = IirCoeffs.initCoeffs();
//      if (params.BW) {
//        delete params.BW;
//      }
    var p = IirCoeffs.preCalcGain(params);
    coeffs.k = 1;
    var sa = 2 * sqrt(p.A) * p.alpha;
    coeffs.a0 = (p.A + 1) - (p.A - 1) * p.cw + sa;
    coeffs.a.add((2 * ((p.A - 1) - (p.A + 1) * p.cw)) / coeffs.a0);
    coeffs.a.add(((p.A + 1) - (p.A - 1) * p.cw - sa) / coeffs.a0);
    coeffs.b.add((p.A * ((p.A + 1) + (p.A - 1) * p.cw + sa)) / coeffs.a0);
    coeffs.b.add((-2 * p.A * ((p.A - 1) + (p.A + 1) * p.cw)) / coeffs.a0);
    coeffs.b.add((p.A * ((p.A + 1) + (p.A - 1) * p.cw - sa)) / coeffs.a0);
    return coeffs;
  }

  // taken from: Design of digital filters for frequency weightings (A and C) required for risk assessments of workers exposed to noise
  // use Butterworth one stage IIR filter to get the results from the paper
  Coeffs aweighting(IirParams iparams) {
    final params = iparams as FcFsQParams;
    var coeffs = IirCoeffs.initCoeffs();
    coeffs.k = 1;
    var wo = 2 * pi * params.Fc! / params.Fs!;
    var w = 2 * tan(wo / 2);
    var Q = params.Q!;
    var wsq = pow(w, 2).toDouble();
    coeffs.a0 = 4 * Q + wsq * Q + 2 * w;
    coeffs.a.add(2 * wsq * Q - 8 * Q);
    coeffs.a.add((4 * Q + wsq * Q - 2 * w));
    coeffs.b.add(wsq * Q);
    coeffs.b.add(2 * wsq * Q);
    coeffs.b.add(wsq * Q);
    return coeffs;
  }

  @override
  void operator []=(key, value) {}

  @override
  void clear() {}

  Map<String, Coeffs Function(IirParams)> get fns =>
      {"aweighting": aweighting, "highshelf": highshelf, "highpass": highpass};
  Coeffs Function(IirParams)? operator [](Object? key) {
    return fns[key];
  }

  @override
  Iterable<String> get keys => fns.keys;

  @override
  remove(Object? key) {
    throw UnimplementedError();
  }
}

class IirParams {
  int? order;
  double? Fa;
  double? Fb;
  double? gain;
  double? preGain;
  bool? oneDb;
  String? transform;
  String? characteristic;
  double? Att;
  double? as;
  double? bs;

  IirParams({
    this.order,
    this.Fa,
    this.Fb,
    this.gain,
    this.preGain,
    this.oneDb,
    this.transform,
    this.characteristic,
    this.Att,
    this.as,
    this.bs,
  });
}

class PZParams extends IirParams {
  Complex z0;
  Complex z1;

  Complex p0;

  Complex p1;
  String type;
  PZParams(
      {required this.z0,
      required this.z1,
      required this.p0,
      required this.p1,
      required this.type});
}

class FcFsQParams extends IirParams {
  double Fc;
  double Fs;
  double Q;

  FcFsQParams({required this.Fc, required this.Fs, required this.Q});
}

class BWFcFsQParams extends FcFsQParams {
  double? BW;

  BWFcFsQParams(
      {required this.BW,
      required double Fc,
      required double Fs,
      required double Q})
      : super(Fc: Fc, Fs: Fs, Q: Q);
}
