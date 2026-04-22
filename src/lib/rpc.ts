import { config as loadEnv } from 'dotenv';
import { JsonRpcProvider } from 'ethers';

loadEnv();

function getRpcUrlFromEnv(): string | undefined {
  if (process.env.ALCHEMY_API_KEY) {
    return `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  }

  if (process.env.INFURA_API_KEY) {
    return `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  }

  if (process.env.MAINNET_RPC_URL) {
    return process.env.MAINNET_RPC_URL;
  }

  return undefined;
}

export function getMainnetRpcUrl(): string {
  return getRpcUrlFromEnv() ?? 'https://eth.llamarpc.com';
}

export function getMainnetProvider(): JsonRpcProvider {
  return new JsonRpcProvider(getMainnetRpcUrl(), 1);
}
