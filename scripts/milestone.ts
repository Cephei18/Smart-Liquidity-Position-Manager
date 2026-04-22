import { getMainnetProvider } from '../src/lib/rpc';
import {
  buildRangeForUsdcPerEth,
  buildWethUsdcPool,
  fetchPoolState,
  formatPositionSummary,
  getUsdcPerEthFromTick,
  positionFromAmount0ForOneEthRange,
} from '../src/lib/uniswap';

const TARGET_PRICE = 1850;
const RANGE_LOW = 1600;
const RANGE_HIGH = 2100;

async function main(): Promise<void> {
  const provider = getMainnetProvider();
  const state = await fetchPoolState(provider);
  const pool = buildWethUsdcPool(state);

  const range = buildRangeForUsdcPerEth({
    tickSpacing: state.tickSpacing,
    lowerUsdcPerEth: RANGE_LOW,
    upperUsdcPerEth: RANGE_HIGH,
  });

  const { fromAmount0 } = positionFromAmount0ForOneEthRange({
    pool,
    lowerTick: range.lowerTick,
    upperTick: range.upperTick,
  });

  const summary = formatPositionSummary(fromAmount0);
  const currentOnChainPrice = getUsdcPerEthFromTick(state.tick);

  console.log(`On-chain spot price (USDC per ETH): ${currentOnChainPrice.toFixed(2)}`);
  console.log(
    `For WETH/USDC pool, price=${TARGET_PRICE}, range [${RANGE_LOW}, ${RANGE_HIGH}], depositing 1 ETH requires ${summary.requiredUsdc} USDC and produces ${summary.liquidity} units of liquidity.`,
  );
  console.log(
    `Position.fromAmount0 check: amount0=${summary.requiredUsdc} USDC, amount1=${summary.requiredEth} ETH, liquidity=${summary.liquidity}`,
  );
}

main().catch((error) => {
  console.error('milestone script failed:', error);
  process.exitCode = 1;
});
