'use strict';

/**
 * Test filter
 */
export default class TestFilter {
  simData: any[] = []
  f: any
  constructor(filter: any) {
    this.f = filter;
  }


  randomValues(params: any) {
    for (let cnt = 0; cnt < params.steps; cnt++) {
      this.simData.push(this.f.singleStep(((Math.random() - 0.5) * params.pp) + params.offset));
    }
  }

  stepValues(params: any) {
    const max = params.offset + params.pp;
    const min = params.offset - params.pp;
    for (let cnt = 0; cnt < params.steps; cnt++) {
      if ((cnt % 200) < 100) {
        this.simData.push(this.f.singleStep(max));
      } else {
        this.simData.push(this.f.singleStep(min));
      }
    }
  }

  impulseValues(params: any) {
    const max = params.offset + params.pp;
    const min = params.offset - params.pp;
    for (let cnt = 0; cnt < params.steps; cnt++) {
      if (cnt % 100 === 0) {
        this.simData.push(this.f.singleStep(max));
      } else {
        this.simData.push(this.f.singleStep(min));
      }
    }
  }

  rampValues(params: any) {
    const max = params.offset + params.pp;
    const min = params.offset - params.pp;
    let val = min;
    const diff = (max - min) / 100;
    for (let cnt = 0; cnt < params.steps; cnt++) {
      if (cnt % 200 < 100) {
        val += diff;
      } else {
        val -= diff;
      }
      this.simData.push(this.f.singleStep(val));
    }
  }

  randomStability(params: any) {
    this.f.reinit();
    this.simData.length = 0;
    this.randomValues(params);
    for (let cnt = params.setup; cnt < this.simData.length; cnt++) {
      if (this.simData[cnt] > params.maxStable || this.simData[cnt] < params.minStable) {
        return this.simData[cnt];
      }
    }
    return true;
  }
  directedRandomStability(params: any) {
    this.f.reinit();
    this.simData.length = 0;
    let i;
    for (i = 0; i < params.tests; i++) {
      const choose = Math.random();
      if (choose < 0.25) {
        this.randomValues(params);
      } else if (choose < 0.5) {
        this.stepValues(params);
      } else if (choose < 0.75) {
        this.impulseValues(params);
      } else {
        this.rampValues(params);
      }
    }
    this.randomValues(params);
    for (let cnt = params.setup; cnt < this.simData.length; cnt++) {
      if (this.simData[cnt] > params.maxStable || this.simData[cnt] < params.minStable) {
        return this.simData[cnt];
      }
    }
    return true;
  }
  evaluateBehavior() {

  }
}

