var utils = require('web3-utils')
var ethjs = require('ethjs-abi')
var ProxyFactory = artifacts.require('./ProxyFactory.sol')
var Erc20Main = artifacts.require('./ERC20Main.sol')
const {
  testWillThrow
} = require('./helpers/main.js')

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
  let proxyAddress;

  before(done => {
    ;(async () => {
      try {
        proxyFactory = await ProxyFactory.deployed();
        console.log(_ + '-----------------------')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })

  describe('ProxyFactory.sol', function() {
    it('should create an erc20 contract', async function() {
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
      const proxy = await proxyFactory.createProxy(data, { value: utils.toWei("10", "ether") })
      proxyAddress = proxy.receipt.logs[0].address;
      console.log(`proxyAddress is  ${proxyAddress}`)
      var erc20Instance = Erc20Main.at(proxyAddress);
      var decimals = await erc20Instance.decimals();
      assert(decimals.toString() === '18', 'balance should equal sent amount')
    })

    it('should should not throw allow initMeme to be called again', async function() {
      var erc20Instance = Erc20Main.at(proxyAddress);
      // var inited = await erc20Instance.initMeme(name, symbol, hashFunction, size, memehash, 0);
      await testWillThrow(erc20Instance.initMeme, [name, symbol, hashFunction, size, memehash, 0])
      // assert.throws(erc20Instance.initMeme(name, symbol, hashFunction, size, memehash, 0),
      //  'initMeme cannot be called twice')
    })
  })
})
