const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const vm = require('vm');

const perlinCode = fs.readFileSync('perlin.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(perlinCode, sandbox);
const noise = sandbox.noise;

describe('simplex2', function() {
  beforeEach(function() {
    noise.seed(123);
  });

  it('should return deterministic values for a given seed', function() {
    const val1 = noise.simplex2(0.5, 0.5);
    noise.seed(123);
    const val2 = noise.simplex2(0.5, 0.5);
    expect(val1).to.equal(val2);
  });

  it('should return different values for different inputs', function() {
    const val1 = noise.simplex2(0.5, 0.5);
    const val2 = noise.simplex2(0.5, 0.6);
    expect(val1).to.not.equal(val2);
  });

  it('should return different values for different seeds', function() {
    const val1 = noise.simplex2(0.5, 0.5);
    noise.seed(456);
    const val2 = noise.simplex2(0.5, 0.5);
    expect(val1).to.not.equal(val2);
  });

  it('should return values roughly between -1 and 1', function() {
    for (let i = 0; i < 100; i++) {
      const val = noise.simplex2(Math.random() * 100, Math.random() * 100);
      expect(val).to.be.at.least(-1.1);
      expect(val).to.be.at.most(1.1);
    }
  });

  it('should return 0 at the origin', function() {
    const val = noise.simplex2(0, 0);
    expect(val).to.equal(0);
  });

  it('should return valid noise for integer inputs', function() {
    const val1 = noise.simplex2(1, 1);
    const val2 = noise.simplex2(2, 2);
    expect(val1).to.be.a('number');
    expect(val2).to.be.a('number');
  });

  it('should return valid noise for negative inputs', function() {
    const val1 = noise.simplex2(-1.5, -2.5);
    expect(val1).to.be.a('number');
  });
});
