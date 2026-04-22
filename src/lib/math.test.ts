import { describe, expect, it } from 'vitest';

import { priceToTick, tickToPrice } from './math';

describe('price/tick conversion utilities', () => {
  it('keeps round-trip error below 0.5% for WETH/USDC style decimals', () => {
    const inputPrice = 1850;
    const tick = priceToTick({
      price: inputPrice,
      baseDecimals: 18,
      quoteDecimals: 6,
    });

    const recovered = tickToPrice({
      tick,
      baseDecimals: 18,
      quoteDecimals: 6,
    });

    const relativeError = Math.abs(recovered - inputPrice) / inputPrice;
    expect(relativeError).toBeLessThan(0.005);
  });

  it('maps tick=0 to decimal-adjusted parity', () => {
    const price = tickToPrice({
      tick: 0,
      baseDecimals: 18,
      quoteDecimals: 6,
    });

    expect(price).toBe(10 ** 12);
  });

  it('rejects non-positive prices', () => {
    expect(() =>
      priceToTick({
        price: 0,
        baseDecimals: 18,
        quoteDecimals: 6,
      }),
    ).toThrow();
  });
});
import { describe, expect, it } from 'vitest';

import { priceToTick, tickToPrice } from './math';

describe('price/tick utilities', () => {
  it('converts price to tick and back for ETH/USDC-style decimals', () => {
    const inputPrice = 1850;
    const tick = priceToTick({
      price: inputPrice,
      baseDecimals: 18,
      quoteDecimals: 6,
    });

    const backToPrice = tickToPrice({
      tick,
      baseDecimals: 18,
      quoteDecimals: 6,
    });

    expect(backToPrice).toBeGreaterThan(0);
    expect(Math.abs(backToPrice - inputPrice) / inputPrice).toBeLessThan(0.001);
  });

  it('returns 1.0 price around tick 0 when decimals are equal', () => {
    const price = tickToPrice({
      tick: 0,
      baseDecimals: 18,
      quoteDecimals: 18,
    });

    expect(price).toBeCloseTo(1, 12);
  });

  it('throws on non-positive prices', () => {
    expect(() =>
      priceToTick({
        price: 0,
        baseDecimals: 18,
        quoteDecimals: 6,
      }),
    ).toThrow();
  });
});
