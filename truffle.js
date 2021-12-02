require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')
console.log('truffle.js')
module.exports = {
  compilers: {
    solc: {
      version: "0.4.24",
      parser: "solcjs",
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000000
        }
      }
    }
  },
  networks: {
    develop: {
      provider() {
        return new HDWalletProvider(
          process.env.TRUFFLE_MNEMONIC,
          'http://localhost:9545/'
        )
      },
      host: 'localhost',
      port: 9545,
      network_id: 4447
    },
    ganache: {
      provider() {
        return new HDWalletProvider(
          process.env.GANACHE_MNEMONIC,
          'http://localhost:7545'
        )
      },
      host: 'localhost',
      port: 7545,
      network_id: 5777
      // gas: 10000000,
      // gasPrice: 1000000000
    },
    kovan: {
      provider() {
        // using wallet at index 1 ----------------------------------------------------------------------------------------v
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://kovan.infura.io/' + process.env.INFURA_API_KEY
        )
      },
      network_id: 42
      // gas: 5561260
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://rinkeby.infura.io/' + process.env.INFURA_API_KEY
        )
      },
      network_id: 4
      // gas: 4700000,
      // gasPrice: 20000000000
    },
    evmos: {
      provider() {
        return new HDWalletProvider(
          process.env.ETHERMINT_KEY,
          // 'https://ethereum.rpc.evmos.dev'
          'http://104.154.133.55:8545'
          // 'https://evmos-evm-rpc.tk/'
        )
      },
      network_id: 9000
      // gas: 4700000,
      // gasPrice: 20000000000
    },
    ropsten: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://ropsten.infura.io/' + process.env.INFURA_API_KEY
        )
      },
      network_id: 2
      // gas: 4700000
    },
    sokol: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://sokol.poa.network'
        )
      },
      gasPrice: 1000000000,
      network_id: 77
    },
    poa: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://core.poa.network'
        )
      },
      gasPrice: 1000000000,
      network_id: 99
    }
  }
}
