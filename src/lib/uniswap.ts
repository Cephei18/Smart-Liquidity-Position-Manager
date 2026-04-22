import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { nearestUsableTick, Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Contract, formatUnits, type Provider } from 'ethers';
import JSBI from 'jsbi';

import { CHAIN_ID_MAINNET, TOKENS, WETH_USDC_POOL_03 } from './constants';
import { priceToTick, tickToPrice } from './math';

const I_UNISWAP_V3_POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function tickSpacing() external view returns (int24)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function fee() external view returns (uint24)',
] as const;

export type PoolState = {
  sqrtPriceX96: string;
  tick: number;
  liquidity: string;
  tickSpacing: number;
  token0: string;
  token1: string;
  fee: number;
};

const usdc = new Token(
  CHAIN_ID_MAINNET,
  TOKENS.USDC.address,
  TOKENS.USDC.decimals,
  TOKENS.USDC.symbol,
  TOKENS.USDC.name,
);

const weth = new Token(
  CHAIN_ID_MAINNET,
  TOKENS.WETH.address,
  TOKENS.WETH.decimals,
  TOKENS.WETH.symbol,
  TOKENS.WETH.name,
);

export async function fetchPoolState(provider: Provider): Promise<PoolState> {
  const pool = new Contract(
    WETH_USDC_POOL_03.address,
    I_UNISWAP_V3_POOL_ABI,
    provider,
  );

  const [slot0, liquidity, tickSpacing, token0, token1, fee] =
    await Promise.all([
      pool.slot0(),
      pool.liquidity(),
      pool.tickSpacing(),
      pool.token0(),
      pool.token1(),
      pool.fee(),
    ]);

  return {
    sqrtPriceX96: slot0[0].toString(),
    tick: Number(slot0[1]),
    liquidity: liquidity.toString(),
    tickSpacing: Number(tickSpacing),
    token0,
    token1,
    fee: Number(fee),
  };
}

export function buildWethUsdcPool(state: PoolState): Pool {
  return new Pool(
    usdc,
    weth,
    state.fee,
    state.sqrtPriceX96,
    state.liquidity,
    state.tick,
  );
}

export function getUsdcPerEthFromTick(tick: number): number {
  const wethPerUsdc = tickToPrice({
    tick,
    baseDecimals: TOKENS.USDC.decimals,
    quoteDecimals: TOKENS.WETH.decimals,
  });

  return 1 / wethPerUsdc;
}

export function getTickFromUsdcPerEth(priceUsdcPerEth: number): number {
  const wethPerUsdc = 1 / priceUsdcPerEth;

  return priceToTick({
    price: wethPerUsdc,
    baseDecimals: TOKENS.USDC.decimals,
    quoteDecimals: TOKENS.WETH.decimals,
  });
}

export function toRawUnits(amount: string | number, decimals: number): JSBI {
  const [whole, fraction = ''] = String(amount).split('.');
  const padded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  const normalized = `${whole}${padded}`.replace(/^0+(?=\d)/, '') || '0';
  return JSBI.BigInt(normalized);
}

export function fromRawUnits(raw: JSBI, decimals: number): string {
  return formatUnits(raw.toString(), decimals);
}

export function buildPositionFromAmount0(params: {
  pool: Pool;
  lowerTick: number;
  upperTick: number;
  amount0Raw: JSBI;
}): Position {
  return Position.fromAmount0({
    pool: params.pool,
    tickLower: params.lowerTick,
    tickUpper: params.upperTick,
    amount0: params.amount0Raw,
    useFullPrecision: true,
  });
}

export function buildPositionFromOneEth(params: {
  pool: Pool;
  lowerTick: number;
  upperTick: number;
}): Position {
  const oneEth = toRawUnits('1', TOKENS.WETH.decimals);

  return Position.fromAmount1({
    pool: params.pool,
    tickLower: params.lowerTick,
    tickUpper: params.upperTick,
    amount1: oneEth,
  });
}

export function buildRangeForUsdcPerEth(params: {
  tickSpacing: number;
  lowerUsdcPerEth: number;
  upperUsdcPerEth: number;
}): { lowerTick: number; upperTick: number } {
  const lowerTickRaw = getTickFromUsdcPerEth(params.lowerUsdcPerEth);
  const upperTickRaw = getTickFromUsdcPerEth(params.upperUsdcPerEth);

  return {
    lowerTick: nearestUsableTick(lowerTickRaw, params.tickSpacing),
    upperTick: nearestUsableTick(upperTickRaw, params.tickSpacing),
  };
}

export function formatPositionSummary(position: Position): {
  liquidity: string;
  requiredUsdc: string;
  requiredEth: string;
} {
  const slippage = new Percent(0);
  const mintAmounts = position.mintAmountsWithSlippage(slippage);

  return {
    liquidity: position.liquidity.toString(),
    requiredUsdc: formatUnits(mintAmounts.amount0.toString(), TOKENS.USDC.decimals),
    requiredEth: formatUnits(mintAmounts.amount1.toString(), TOKENS.WETH.decimals),
  };
}

export function positionFromAmount0ForOneEthRange(params: {
  pool: Pool;
  lowerTick: number;
  upperTick: number;
}): {
  fromAmount0: Position;
  usdcAmountRaw: JSBI;
} {
  const fromOneEth = buildPositionFromOneEth({
    pool: params.pool,
    lowerTick: params.lowerTick,
    upperTick: params.upperTick,
  });

  const mintAmounts = fromOneEth.mintAmounts;
  const usdcAmountRaw = JSBI.BigInt(mintAmounts.amount0.toString());

  return {
    fromAmount0: buildPositionFromAmount0({
      pool: params.pool,
      lowerTick: params.lowerTick,
      upperTick: params.upperTick,
      amount0Raw: usdcAmountRaw,
    }),
    usdcAmountRaw,
  };
}

export const WETH_USDC_POOL_ADDRESS = WETH_USDC_POOL_03.address;
