import { getMainnetProvider, getMainnetRpcUrl } from '../src/lib/rpc';
import {
  fetchPoolState,
  getUsdcPerEthFromTick,
  WETH_USDC_POOL_ADDRESS,
} from '../src/lib/uniswap';

async function main(): Promise<void> {
  const provider = getMainnetProvider();
  const state = await fetchPoolState(provider);
  const priceUsdcPerEth = getUsdcPerEthFromTick(state.tick);

  console.log(`RPC URL: ${getMainnetRpcUrl()}`);
  console.log(`Pool: ${WETH_USDC_POOL_ADDRESS}`);
  console.log(`token0: ${state.token0}`);
  console.log(`token1: ${state.token1}`);
  console.log(`fee: ${state.fee}`);
  console.log(`slot0.sqrtPriceX96: ${state.sqrtPriceX96}`);
  console.log(`slot0.tick: ${state.tick}`);
  console.log(`liquidity: ${state.liquidity}`);
  console.log(`implied price (USDC per ETH): ${priceUsdcPerEth.toFixed(6)}`);
}

main().catch((error) => {
  console.error('fetchPoolState failed:', error);
  process.exitCode = 1;
});
