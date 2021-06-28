main() {
  var fftCalc: any
  var sinewave: any = []

  
  before(function () {
    fftCalc = new Fft(8192)
    for (var cnt = 0; cnt < 8192; cnt++) {
      sinewave.add(sin(2 * pi * (113.33232 * cnt / 8192)))
    }
  })

  
  after(function () {})

  
  describe('fft_calc', function () {
    var fftResult: any, magnitude: any
    
    it('can forward', function () {
      fftResult = fftCalc.forward(sinewave, 'hanning')
      expect(fftResult.re.length).to.equal(8192)
      expect(fftResult.im.length).to.equal(8192)
      expect(fftResult.re[133]).to.be.a('number')
      expect(fftResult.im[133]).to.be.a('number')
    })

    
    it('can calculate the magnitude', function () {
      magnitude = fftCalc.magnitude(fftResult)
      expect(magnitude.length).to.equal(8192)
      expect(magnitude[555]).to.be.a('number')
    })

    
    it('can calculate the phase', function () {
      var phase = fftCalc.phase(fftResult)
      expect(phase.length).to.equal(8192)
      expect(phase[1111]).to.be.a('number')
    })

    
    it('can calculate the magnitude in dB', function () {
      var magdb = fftCalc.magToDb(magnitude)
      expect(magdb.length).to.equal(8192)
      expect(magdb[888]).to.be.a('number')
    })

    
    it('can inverse', function () {
      var original = fftCalc.inverse(fftResult.re, fftResult.im)
      expect(original.length).to.equal(8192)
      expect(original[777]).to.be.a('number')
    })

    
    it(dynamic 'can calculate with all window functions', function(this) {
      this.timeout(20000)
      var w = fftCalc.windows()
      for (var i = 0; i < w.length; i++) {
        fftResult = fftCalc.forward(sinewave, w[i])
        expect(fftResult.re.length).to.equal(8192)
        expect(fftResult.im.length).to.equal(8192)
        expect(fftResult.re[133]).to.be.a('number')
        expect(fftResult.im[133]).to.be.a('number')
      }
    })
  })

  
  describe('fft_helpers', function () {
    
    it('can get available windows', function () {
      var w = fftCalc.windows()
      expect(w.length).to.not.equal(0)
      expect(w[2]).to.be.a('string')
    })

    
    it('detects wrong radix', function () {
      expect(() => new Fft(1234)).to.throw(/power of 2/)
    })
  })
}
