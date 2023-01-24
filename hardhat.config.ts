
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

const MNEMONIC = process.env.MNEMONIC;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const configs: HardhatUserConfig = {
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },

    ganache_shared: {
      url: "http://172.25.91.225:8540/",

      chainId: 666,

      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    hardhat: {
      //url: 'http://127.0.0.1:8545/',
      chainId: 31337,
      gas: "auto",
      gasMultiplier: 0,
      accounts: {
        mnemonic: MNEMONIC,
      },
      mining: {
        auto: false,
        interval: [5000, 7000],
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    localganache: {
      url: "http://127.0.0.1:8545/",
      chainId: 1337,
      accounts: {
        mnemonic: MNEMONIC,
      },
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
        enabled: true,
        runs: 250,
      },
    },
  },
};

export default configs;