const p = require('./perlin.js');
// Check if noise is directly on p or inside p.noise
const noise = p && p.noise ? p.noise : p;

describe('noise.seed', () => {
  it('produces deterministic output for the same seed', () => {
    noise.seed(42);
    const val1 = noise.simplex2(1, 1);
    const val2 = noise.simplex2(2, 2);

    noise.seed(42);
    const val3 = noise.simplex2(1, 1);
    const val4 = noise.simplex2(2, 2);

    expect(val1).toBe(val3);
    expect(val2).toBe(val4);
  });

  it('produces different output for different seeds', () => {
    noise.seed(42);
    const val1 = noise.simplex2(1, 1);

    noise.seed(43);
    const val2 = noise.simplex2(1, 1);

    expect(val1).not.toBe(val2);
  });

  it('handles fractional seeds correctly by scaling them out', () => {
    // A fractional seed like 0.5 is scaled to 32768
    noise.seed(0.5);
    const val1 = noise.simplex2(1, 1);

    noise.seed(32768); // 0.5 * 65536
    const val2 = noise.simplex2(1, 1);

    expect(val1).toBe(val2);
  });

  it('handles small integer seeds (< 256) correctly', () => {
    // When seed < 256, seed |= seed << 8
    noise.seed(10);
    const val1 = noise.simplex2(1, 1);

    const expectedSeed = 10 | (10 << 8); // 2570
    noise.seed(expectedSeed);
    const val2 = noise.simplex2(1, 1);

    expect(val1).toBe(val2);
  });

  it('handles seed values equal to or larger than 256 normally', () => {
    noise.seed(256);
    const val1 = noise.simplex2(1, 1);

    noise.seed(0); // This shouldn't be the same as 256 for a good seed, let's just make sure they are different
    const val2 = noise.simplex2(1, 1);

    expect(val1).not.toBe(val2);
  });

  it('works with seed 0', () => {
    noise.seed(0);
    const val1 = noise.simplex2(1, 1);
    expect(typeof val1).toBe('number');
  });

  it('handles fractional seed edge case just below 1', () => {
    noise.seed(0.9999);
    const val1 = noise.simplex2(1, 1);

    // 0.9999 * 65536 = 65529.4464 -> Math.floor -> 65529
    noise.seed(65529);
    const val2 = noise.simplex2(1, 1);

    expect(val1).toBe(val2);
  });
});
