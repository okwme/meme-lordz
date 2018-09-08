var utils = require('web3-utils')
var ethjs = require('ethjs-abi')
var ProxyFactory = artifacts.require('./ProxyFactory.sol')
var Erc20Main = artifacts.require('./ERC20Main.sol')

let gasPrice = 1000000000 // 1GWEI

let _ = '        '

contract('ProxyFactory', async function(accounts) {
  let proxyFactory;
  let erc20Main;
  let name = 'Memecoin';
  let symbol = 'MEME';
  let hashFunction = '12';
  let size = '20';
  let memehash = '0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89';

  before(done => {
    ;(async () => {
      try {
        var totalGas = new web3.BigNumber(0)

        // console.log('In ProxyFactory tests')
        // var nonce = await web3.eth.getTransactionCount(web3.eth.accounts[0]);
        // console.log('Nonce is ' + nonce)

        proxyFactory = await ProxyFactory.deployed();

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })

  describe('ProxyFactory.sol', function() {
    it('should create a contract', async function() {
      const initMeme = {
        "constant": false,
        "inputs": [
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_symbol",
            "type": "string"
          },
          {
            "name": "_hashFunction",
            "type": "uint8"
          },
          {
            "name": "_size",
            "type": "uint8"
          },
          {
            "name": "_memehash",
            "type": "bytes32"
          },
          {
            "name": "numTokens",
            "type": "uint256"
          }
        ],
        "name": "initMeme",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      }
      const data = ethjs.encodeMethod(initMeme, [name, symbol, hashFunction, size, memehash, 0]);
      console.log(data)
      const proxy = await proxyFactory.createProxy(data)
      console.log(proxy)
      console.log(proxy.receipt.logs)


      assert(true === true, 'this is true')
    })
  })
})

function getBlockNumber() {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) reject(error)
      resolve(result)
    })
  })
}

function increaseBlocks(blocks) {
  return new Promise((resolve, reject) => {
    increaseBlock().then(() => {
      blocks -= 1
      if (blocks == 0) {
        resolve()
      } else {
        increaseBlocks(blocks).then(resolve)
      }
    })
  })
}

function increaseBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: 12345
      },
      (err, result) => {
        if (err) reject(err)
        resolve(result)
      }
    )
  })
}

function decodeEventString(hexVal) {
  return hexVal
    .match(/.{1,2}/g)
    .map(a =>
      a
        .toLowerCase()
        .split('')
        .reduce(
          (result, ch) => result * 16 + '0123456789abcdefgh'.indexOf(ch),
          0
        )
    )
    .map(a => String.fromCharCode(a))
    .join('')
}
