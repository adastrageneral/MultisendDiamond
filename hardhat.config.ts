
require("dotenv").config()
/* global ethers task */ 
import "@nomiclabs/hardhat-truffle5";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/types";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
import "solidity-coverage"; 

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task('accounts', 'Prints the list of accounts', async () => {
//   const accounts = await ethers.getSigners()

//   for (const account of accounts) {
//     console.log(account.address)
//   }
// })

// const ACCOUNTS: string | any[] = process.env.MNEMONIC | [process.env.PRIVATEKEYDEPLOYER];


const accounts = {
  mnemonic: process.env.MNEMONIC
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const configs: HardhatUserConfig = {
  networks: {
    bsc_testnet: {
      chainId: 97,
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts 
    },
    mumbai: {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com",
      accounts
    },
    fuji: {
      url: "https://endpoints.omniatech.io/v1/avax/fuji/public",
      gasPrice: 225000000000,

      chainId: 43113,

      accounts,
    },

    cchain_mainnet: {
      url: "https://endpoints.omniatech.io/v1/avax/mainnet/public	",
      gasPrice: 225000000000,

      chainId: 43114,

      accounts,
    },
    scroll_testnet: {
      url: "https://alpha-rpc.scroll.io/l2",

      chainId: 534353,

      accounts,
    },
    hardhat: {
      //url: 'http://127.0.0.1:8545/',
      chainId: 31337,
      gas: "auto",
      gasMultiplier: 0,
      accounts,

    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      accounts,
    },

  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    //  apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    currency: "eur",
    gasPrice: 25,
    coinmarketcap: "47abd28e-6337-4cc9-89b4-11083810bc28",
    token: "AVAX",
  },
  mocha: {
    timeout: 100000000,
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: false,
        runs: 250,
      },
    },
  },
};

export default configs;