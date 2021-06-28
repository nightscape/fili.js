import 'package:fili.dart/calc_cascades.dart';
import 'package:fili.dart/iir_coeffs.dart';

import 'package:fili.dart/iir_filter.dart';
import 'package:test/test.dart';

void main() {
  var iirCascadeCalculator = new CalcCascades();

  group('iir-bessel-bandstop', () {
    IirCoeffs filterCoeffs = iirCascadeCalculator.bandstop(
        order: 3, characteristic: 'bessel', Fs: 4000, Fc: 500);
    List<double> filter = IirFilter(filterCoeffs);
    test('can calculate coeffs', () {
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint(Fs: 4000, Fr: 211);
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-bessel-lp', () {
    IirCoeffs filterCoeffs = iirCascadeCalculator.lowpass(
        order: 3, characteristic: 'bessel', Fs: 4000, Fc: 500);
    List<double> filter;

    test('can calculate coeffs', () {
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      filterCoeffs[1].k.should.not.equal(1);
    });

    test('can generate a filter', () {
      filter = new IirFilter(filterCoeffs);
      // filter.should.be.an.Object
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint({Fs: 4000, Fr: 211});
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-bessel-hp', () {
    IirCoeffs filterCoeffs;
    List<double> filter;

    test('can calculate coeffs', () {
      filterCoeffs = iirCascadeCalculator
          .highpass({order: 2, characteristic: 'bessel', Fs: 4000, Fc: 500});
      expect(filterCoeffs.length, equals(2));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));

      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      filterCoeffs[1].k.should.not.equal(1);
    });

    test('can generate a filter', () {
      filter = new IirFilter(filterCoeffs);
      // filter.should.be.an.Object
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint({Fs: 4000, Fr: 211});
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-butterworth-hp', () {
    IirCoeffs filterCoeffs;
    List<double> filter;

    test('can calculate coeffs', () {
      filterCoeffs = iirCascadeCalculator.highpass(
          order: 3, characteristic: 'butterworth', Fs: 8000, Fc: 2234);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));

      filterCoeffs = iirCascadeCalculator.highpass(
          order: 3,
          characteristic: 'butterworth',
          Fs: 8000,
          Fc: 1234,
          preGain: true);

      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      filterCoeffs[1].k.should.not.equal(1);
    });

    test('can generate a filter', () {
      filter = new IirFilter(filterCoeffs);
      // filter.should.be.an.Object
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint(Fs: 4000, Fr: 211);
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-butterworth-lp', () {
    IirCoeffs filterCoeffs;
    List<double> filter;

    test('can calculate coeffs', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 2, characteristic: 'butterworth', Fs: 8000, Fc: 1234);
      expect(filterCoeffs.length, equals(2));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));

      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'butterworth',
          Fs: 8000,
          Fc: 1234,
          preGain: true);

      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      filterCoeffs[1].k.should.not.equal(1);
    });

    test('can generate a filter', () {
      filter = new IirFilter(filterCoeffs);
      // filter.should.be.an.Object
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint({Fs: 4000, Fr: 211});
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-butterworth-bandstop', () {
    IirCoeffs filterCoeffs;
    List<double> filter;

    test('can calculate coeffs', () {
      filterCoeffs = iirCascadeCalculator.bandstop(
          {order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500});
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can generate a filter', () {
      filter = new IirFilter(filterCoeffs);
      // filter.should.be.an.Object
    });

    test('can do a single step', () {
      var out = filter.singleStep(10);
      // out.should.be.a.Number
      out.should.not.equal(0);
    });

    test('can do multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('can simulate multiple steps', () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.add(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      // out.should.be.an.Array
      expect(out.length, equals(10000));
      out[111].should.not.equal(simInput[111]);
    });

    test('calculates impulse response', () {
      var r = filter.impulseResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates step response', () {
      var r = filter.stepResponse(100);
      // r.should.be.an.Object
      // r.out.should.be.an.Array
      expect(r.out.length, equals(100));
      // r.min.should.be.an.Object
      // r.min.sample.should.be.a.Number
      // r.min.value.should.be.a.Number
      // r.max.should.be.an.Object
      // r.max.sample.should.be.a.Number
      // r.max.value.should.be.a.Number
    });

    test('calculates filter response', () {
      var r = filter.response(200);
      // r.should.be.an.Array
      expect(r.length, equals(200));
      // r[20].should.be.an.Object
      // r[20].magnitude.should.be.a.Number
      // r[20].dBmagnitude.should.be.a.Number
      // r[20].phase.should.be.a.Number
      // r[20].unwrappedPhase.should.be.a.Number
      // r[20].phaseDelay.should.be.a.Number
      // r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      // r.should.be.an.Array
      expect(r.length, equals(100));
    });

    test('calculates single filter response', () {
      var r = filter.responsePoint(Fs: 4000, Fr: 211);
      // r.should.be.an.Object
      // r.magnitude.should.be.a.Number
      // r.dBmagnitude.should.be.a.Number
      // r.phase.should.be.a.Number

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    test('reinit does not crash', () {
      filter.reinit();
    });
  });

  group('iir-more-filters', () {
    var filterCoeffs;

    test('can calculate lowpass Bessel matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'bessel',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass Butterworth matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'butterworth',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate allpass matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'allpass',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass Tschebyscheff05 matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'tschebyscheff05',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass Tschebyscheff1 matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'tschebyscheff1',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass Tschebyscheff2 matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'tschebyscheff2',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass Tschebyscheff3 matched-Z', () {
      filterCoeffs = iirCascadeCalculator.lowpass(
          order: 3,
          characteristic: 'tschebyscheff3',
          transform: 'matchedZ',
          Fs: 4000,
          Fc: 500,
          preGain: false);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate allpass bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.allpass(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate A weighting bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.aweighting(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate highshelf bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.highshelf(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowshelf bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.lowshelf(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate peaking filter bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.peak(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate bandpass bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.bandpass(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate bandpass Q bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.bandpassQ(
          order: 3, characteristic: 'butterworth', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate lowpass BesselThomson bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.lowpassBT(
          order: 3, characteristic: 'bessel', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });

    test('can calculate highpass BesselThomson bilinear transform', () {
      filterCoeffs = iirCascadeCalculator.highpassBT(
          order: 3, characteristic: 'bessel', Fs: 4000, Fc: 500);
      expect(filterCoeffs.length, equals(3));
      // filterCoeffs[0].should.be.an.Object
      expect(filterCoeffs[1].a.length, equals(2));
      expect(filterCoeffs[1].b.length, equals(3));
      expect(filterCoeffs[1].z.length, equals(2));
      expect(filterCoeffs[1].z[0], equals(0));
      expect(filterCoeffs[1].k, equals(1));
    });
  });

  group('iir-helpers', () {
    test('can get available filters', () {
      var av = iirCascadeCalculator.available();
      av.length.should.not.equal(0);
      // av[1].should.be.a.String
    });
  });
}
