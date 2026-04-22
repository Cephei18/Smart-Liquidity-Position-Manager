const ONE_POINT_0001 = 1.0001;

export function tickToPrice(params: {
  tick: number;
  baseDecimals: number;
  quoteDecimals: number;
}): number {
  const { tick, baseDecimals, quoteDecimals } = params;
  const rawRatio = ONE_POINT_0001 ** tick;
  const decimalScale = 10 ** (baseDecimals - quoteDecimals);
  return rawRatio * decimalScale;
}

export function priceToTick(params: {
  price: number;
  baseDecimals: number;
  quoteDecimals: number;
}): number {
  const { price, baseDecimals, quoteDecimals } = params;
  const decimalScale = 10 ** (quoteDecimals - baseDecimals);
  const rawRatio = price * decimalScale;

  if (rawRatio <= 0 || !Number.isFinite(rawRatio)) {
    throw new Error('price must map to a positive finite raw ratio');
  }

  return Math.floor(Math.log(rawRatio) / Math.log(ONE_POINT_0001));
}
