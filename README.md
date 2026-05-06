# Smart Liquidity Position Manager

Technical tooling for analyzing and sizing concentrated liquidity positions on **Uniswap V3** (currently focused on **WETH/USDC 0.3% on Ethereum mainnet**).

This repository combines:

1. Uniswap V3 math and pool utilities.
2. Scriptable workflows for fetching on-chain state and simulating a target LP range.
3. A Vite + React frontend scaffold (currently still template UI) for future visualization and interaction.

## Project Goal

The objective is to turn on-chain pool state into practical LP decisions:

1. Read live pool state (`slot0`, `liquidity`, `tick spacing`, token ordering, fee).
2. Convert between tick and price domains with decimal safety.
3. Build a `Pool` and `Position` using the Uniswap V3 SDK.
4. Estimate token requirements and resulting liquidity for a chosen price range.

At the moment, the scripts under `scripts/` are the main product surface.

## Current Capabilities

### 1) Pull live pool state from mainnet

`npm run pool:state`:

1. Connects to Ethereum mainnet using env-based RPC resolution.
2. Queries the canonical WETH/USDC 0.3% V3 pool.
3. Prints key state and implied USDC/ETH spot price from the pool tick.

### 2) Simulate a milestone LP position

`npm run milestone`:

1. Uses a configured range (`1600` to `2100` USDC/ETH in the script).
2. Aligns raw price ticks to valid `tickSpacing`.
3. Builds an equivalent position path (`fromAmount1` then `fromAmount0`) for a 1 ETH notion.
4. Outputs required USDC, ETH, and generated liquidity units.

## Architecture

### Protocol and math layer

- `src/lib/constants.ts`: chain, token metadata, and WETH/USDC pool constants.
- `src/lib/rpc.ts`: RPC URL resolution (`ALCHEMY_API_KEY`, `INFURA_API_KEY`, `MAINNET_RPC_URL`, fallback).
- `src/lib/math.ts`: raw price/tick conversions with decimal normalization.
- `src/lib/uniswap.ts`: pool state reads, `Pool` construction, range conversion, and position synthesis.

### Execution layer

- `scripts/fetchPoolState.ts`: fetch and print current pool diagnostics.
- `scripts/milestone.ts`: deterministic LP scenario for the configured price range.

### Frontend layer

- `src/main.tsx` and `src/App.tsx`: currently a Vite/React starter interface.

## Uniswap V3 Math Model

The code uses Uniswap's tick-price identity:

$$
rawRatio = 1.0001^{tick}
$$

Then adjusts for token decimal asymmetry:

$$
price(base/quote) = rawRatio * 10^{(baseDecimals-quoteDecimals)}
$$

Inverse conversion:

$$
tick = floor( ln(price * 10^{(quoteDecimals-baseDecimals)}) / ln(1.0001) )
$$

For WETH/USDC views in this repo, helper functions convert between the raw orientation and **USDC per ETH** display conventions.

## Build and Tooling

- Runtime: Node.js + TypeScript (ESM).
- Bundler/dev server: Vite.
- Frontend: React.
- Protocol SDKs: `@uniswap/sdk-core`, `@uniswap/v3-sdk`.
- Chain connectivity: `ethers`.
- Tests: `vitest`.
- Linting: ESLint flat config.

Project scripts from `package.json`:

- `npm run dev`: start Vite dev server.
- `npm run build`: TypeScript project build + Vite production bundle.
- `npm run preview`: serve the production bundle locally.
- `npm run lint`: lint TypeScript/TSX.
- `npm run test`: run Vitest once.
- `npm run test:watch`: watch mode tests.
- `npm run pool:state`: fetch live pool state.
- `npm run milestone`: run LP milestone scenario.

## Setup

### Prerequisites

1. Node.js 20+ (recommended).
2. npm 10+.

### Install

```bash
npm install
```

### Optional environment configuration

Create a `.env` file in the repository root if you want a dedicated RPC provider:

```bash
# Prefer one of these
ALCHEMY_API_KEY=your_key
INFURA_API_KEY=your_key

# Or provide a full URL directly
MAINNET_RPC_URL=https://your-mainnet-rpc
```

If none are set, scripts fall back to `https://eth.llamarpc.com`.

## Usage

### Development UI

```bash
npm run dev
```

### Fetch pool state

```bash
npm run pool:state
```

Typical output shape:

```text
RPC URL: ...
Pool: 0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8
token0: ...
token1: ...
fee: 3000
slot0.sqrtPriceX96: ...
slot0.tick: ...
liquidity: ...
implied price (USDC per ETH): ...
```

### Run milestone scenario

```bash
npm run milestone
```

Typical output shape:

```text
On-chain spot price (USDC per ETH): ...
For WETH/USDC pool, price=1850, range [1600, 2100], depositing 1 ETH requires ... USDC and produces ... units of liquidity.
Position.fromAmount0 check: amount0=... USDC, amount1=... ETH, liquidity=...
```

## Testing

```bash
npm run test
```

The math tests validate:

1. Tick/price round-trip behavior.
2. Decimal-normalized parity behavior.
3. Guards against non-positive prices.

## Known State and Next Engineering Steps

Current state:

1. Core Uniswap V3 math and scripts are implemented.
2. Frontend remains starter scaffold and is not yet wired to protocol utilities.

Recommended next steps:

1. Build a position planner UI for range input, deposit sizing, and slippage assumptions.
2. Add historical backtesting against archived ticks.
3. Extend to additional pools/fee tiers and chain IDs.
4. Add integration tests for script outputs and RPC failover behavior.

## Safety Notes

This repository is informational and simulation-oriented. It is not financial advice, execution automation, or production custody software. Always validate assumptions with independent risk controls before deploying liquidity.
