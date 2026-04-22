export const CHAIN_ID_MAINNET = 1;

export const TOKENS = {
  USDC: {
    address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0a0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
} as const;

export const WETH_USDC_POOL_03 = {
  address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  fee: 3000,
} as const;
