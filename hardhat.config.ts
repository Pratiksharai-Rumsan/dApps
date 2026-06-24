/** @type import('hardhat/config').HardhatUserConfig */

import "@nomiclabs/hardhat-ethers";

import * as dotenv from "dotenv";
dotenv.config();

module.exports = {
  solidity: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    // ── Local Hardhat node (default) ──────────────────────────────────────
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // ── Base Sepolia testnet ───────────────────────────────────────────────
    baseSepolia: {
      url: process.env.NETWORK_URL,
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
